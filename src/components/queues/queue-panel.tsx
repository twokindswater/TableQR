'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Queue, FilteredQueues, QueueNotification, QueueWithItems, QueueItemInsert } from '@/types/queue';
import { QueueCard } from './queue-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Minus, X } from 'lucide-react';
import { Tables } from '@/types/database.generated';

type Menu = Tables<'menus'>;

interface QueuePanelProps {
  storeId: number;
}

interface SelectedMenuItem {
  menu: Menu;
  quantity: number;
}

export function QueuePanel({ storeId }: QueuePanelProps) {
  const { toast } = useToast();
  const [queues, setQueues] = useState<QueueWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [selectedMenuItems, setSelectedMenuItems] = useState<SelectedMenuItem[]>([]);

  type NotificationStatus = 'success' | 'failure';

  const fetchQueueNotificationRecipients = useCallback(
    async (queueNumber: number): Promise<Pick<QueueNotification, 'id' | 'fcm_token'>[]> => {
      const { data, error } = await supabase
        .from('queue_notifications')
        .select('id, fcm_token')
        .eq('store_id', storeId)
        .eq('queue_number', queueNumber)
        .not('fcm_token', 'is', null);

      if (error) {
        throw error;
      }

      return (data as Pick<QueueNotification, 'id' | 'fcm_token'>[] | null) ?? [];
    },
    [storeId]
  );

  const updateNotificationStatus = useCallback(
    async (ids: number[], status: NotificationStatus, timestamp: string) => {
      if (ids.length === 0) {
        return;
      }

      const { error } = await supabase
        .from('queue_notifications')
        .update({
          send_status: status,
          notified_at: timestamp,
        })
        .in('id', ids);

      if (error) {
        console.error('알림 상태 업데이트 실패:', error);
      }
    },
    []
  );

  const buildReadyNotificationPayload = useCallback(
    (tokens: string[], queueNumber: number) => {
      const formattedQueueNumber = String(queueNumber).padStart(3, '0');

      return {
        tokens,
        notification: {
          title: '주문 준비 완료',
          body: `#${formattedQueueNumber} 주문이 준비되었습니다.`,
          sound: 'default',
        },
        data: {
          queueNumber: String(queueNumber),
          storeId: String(storeId),
        },
        android: {
          notification: {
            sound: 'default',
            default_vibrate_timings: true,
            default_sound: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          notification: {
            vibrate: [200, 100, 200, 100, 200],
            renotify: true,
            requireInteraction: true,
            sound: 'default',
            tag: `queue-ready-${formattedQueueNumber}`,
          },
        },
      };
    },
    [storeId]
  );

  const sendFcmReadyNotification = useCallback(async (payload: Record<string, unknown>) => {
    const response = await fetch('/api/notifications/fcm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await response.text();
    let parsedBody: Record<string, unknown> | null = null;

    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
      } catch (error) {
        console.warn('FCM 응답 파싱 실패:', error);
      }
    }

    if (!response.ok) {
      const fallbackMessage = rawBody || 'FCM 요청이 실패했습니다.';
      const extractedMessage = parsedBody
        ? (parsedBody as { error?: unknown; message?: unknown; details?: unknown }).error ??
          (parsedBody as { message?: unknown }).message ??
          (parsedBody as { details?: unknown }).details
        : null;

      const message = typeof extractedMessage === 'string' && extractedMessage.trim()
        ? extractedMessage.trim()
        : fallbackMessage;

      throw new Error(message);
    }

    const result = (parsedBody?.result as Record<string, unknown> | undefined) ?? parsedBody;
    const failureCount = Number((result as { failure?: unknown })?.failure ?? 0);

    return {
      failureCount: Number.isFinite(failureCount) ? failureCount : 0,
    };
  }, []);

  // 준비 완료 푸시 알림 전송
  const sendReadyNotification = useCallback(
    async (queueNumber: number | null) => {
      if (!queueNumber) {
        return;
      }

      let recipients: Pick<QueueNotification, 'id' | 'fcm_token'>[] = [];
      const attemptTimestamp = new Date().toISOString();

      try {
        recipients = await fetchQueueNotificationRecipients(queueNumber);

        if (recipients.length === 0) {
          return;
        }

        const tokens = recipients
          .map(({ fcm_token }) => fcm_token)
          .filter((token): token is string => Boolean(token));

        if (tokens.length === 0) {
          return;
        }

        const payload = buildReadyNotificationPayload(tokens, queueNumber);
        const { failureCount } = await sendFcmReadyNotification(payload);
        const status: NotificationStatus = failureCount > 0 ? 'failure' : 'success';

        await updateNotificationStatus(
          recipients.map(({ id }) => id),
          status,
          attemptTimestamp,
        );

        if (status === 'failure') {
          toast({
            title: '푸시 알림 일부 실패',
            description: '일부 푸시 알림이 실패했습니다. 재시도 목록을 확인하세요.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('준비 완료 알림 전송 실패:', error);

        if (recipients.length > 0) {
          await updateNotificationStatus(
            recipients.map(({ id }) => id),
            'failure',
            attemptTimestamp,
          );
        }

        toast({
          title: '알림 전송 실패',
          description: '푸시 알림 전송에 실패했습니다. 로그를 확인해주세요.',
          variant: 'destructive',
        });
      }
    },
    [
      buildReadyNotificationPayload,
      fetchQueueNotificationRecipients,
      sendFcmReadyNotification,
      toast,
      updateNotificationStatus,
    ]
  );

  // Queue 데이터 로드 (주문 항목 포함)
  const loadQueues = useCallback(async () => {
    try {
      const { data: queuesData, error: queuesError } = await supabase
        .from('queues')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (queuesError) throw queuesError;

      // 각 queue에 대한 items를 불러오기
      const queuesWithItems: QueueWithItems[] = await Promise.all(
        (queuesData || []).map(async (queue) => {
          const { data: items, error: itemsError } = await supabase
            .from('queue_items')
            .select('*')
            .eq('queue_id', queue.queue_id)
            .order('created_at', { ascending: true });

          if (itemsError) {
            console.error('주문 항목 로드 실패:', itemsError);
            return { ...queue, items: [] };
          }

          return { ...queue, items: items || [] };
        })
      );

      setQueues(queuesWithItems);
    } catch (error) {
      console.error('주문 목록 로드 실패:', error);
      toast({
        title: '오류',
        description: '주문 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, toast]);

  // 메뉴 데이터 로드
  const loadMenus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setMenus(data || []);
    } catch (error) {
      console.error('메뉴 로드 실패:', error);
    }
  }, [storeId]);

  // 초기 로드
  useEffect(() => {
    loadQueues();
    loadMenus();
  }, [loadQueues, loadMenus]);

  // 실시간 구독
  useEffect(() => {
    const channel = supabase
      .channel(`queues:store_id=eq.${storeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queues',
          filter: `store_id=eq.${storeId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newQueue = payload.new as Queue;
            // 새 queue의 items도 불러오기
            const { data: items } = await supabase
              .from('queue_items')
              .select('*')
              .eq('queue_id', newQueue.queue_id)
              .order('created_at', { ascending: true });
            
            setQueues((prev) => [{ ...newQueue, items: items || [] }, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setQueues((prev) =>
              prev.map((q) =>
                q.queue_id === (payload.new as Queue).queue_id 
                  ? { ...(payload.new as Queue), items: q.items } 
                  : q
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setQueues((prev) =>
              prev.filter((q) => q.queue_id !== (payload.old as Queue).queue_id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId]);

  // 자동 삭제 체크 (5분마다)
  useEffect(() => {
    const checkExpiredQueues = async () => {
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const oneHourAgoISO = oneHourAgo.toISOString();
        
        // status 1 (준비 완료)이고 called_at이 1시간 이상 지난 항목 삭제
        const { error: error1 } = await supabase
          .from('queues')
          .delete()
          .eq('store_id', storeId)
          .eq('status', 1)
          .lt('called_at', oneHourAgoISO);
        
        if (error1 && error1.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('자동 삭제 실패 (준비 완료):', error1);
        }
        
        // status 2 (완료)이고 completed_at이 1시간 이상 지난 항목 삭제
        const { error: error2 } = await supabase
          .from('queues')
          .delete()
          .eq('store_id', storeId)
          .eq('status', 2)
          .lt('completed_at', oneHourAgoISO);
        
        if (error2 && error2.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('자동 삭제 실패 (완료):', error2);
        }
      } catch (error) {
        console.error('자동 삭제 체크 실패:', error);
      }
    };

    // 초기 실행
    checkExpiredQueues();
    
    // 5분마다 실행
    const interval = setInterval(checkExpiredQueues, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [storeId]);

  // 메뉴 선택 다이얼로그 열기
  const handleOpenMenuDialog = () => {
    if (menus.length === 0) {
      toast({
        title: '알림',
        description: '등록된 메뉴가 없습니다. 먼저 메뉴를 등록해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedMenuItems([]);
    setIsMenuDialogOpen(true);
  };

  // 메뉴 추가
  const handleAddMenuItem = (menu: Menu) => {
    const existing = selectedMenuItems.find((item) => item.menu.menu_id === menu.menu_id);
    if (existing) {
      setSelectedMenuItems(
        selectedMenuItems.map((item) =>
          item.menu.menu_id === menu.menu_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedMenuItems([...selectedMenuItems, { menu, quantity: 1 }]);
    }
  };

  // 메뉴 수량 변경
  const handleChangeQuantity = (menuId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedMenuItems(selectedMenuItems.filter((item) => item.menu.menu_id !== menuId));
    } else {
      setSelectedMenuItems(
        selectedMenuItems.map((item) =>
          item.menu.menu_id === menuId ? { ...item, quantity } : item
        )
      );
    }
  };

  // 메뉴 항목 제거
  const handleRemoveMenuItem = (menuId: number) => {
    setSelectedMenuItems(selectedMenuItems.filter((item) => item.menu.menu_id !== menuId));
  };

  // 새 주문 생성 (메뉴 포함)
  const handleGenerateQueue = async () => {
    try {
      setActionLoading(true);

      // 랜덤 3자리 숫자 생성 함수 (1-999)
      const generateRandomNumber = () => Math.floor(Math.random() * 999) + 1;

      // 기존 주문번호 조회
      const { data: existingQueues } = await supabase
        .from('queues')
        .select('queue_number')
        .eq('store_id', storeId);

      const existingNumbers = new Set(
        existingQueues?.map((q) => q.queue_number) || []
      );

      // 중복되지 않는 랜덤 번호 찾기 (최대 100번 시도)
      let queueNumber = generateRandomNumber();
      let attempts = 0;
      const maxAttempts = 100;

      while (existingNumbers.has(queueNumber) && attempts < maxAttempts) {
        queueNumber = generateRandomNumber();
        attempts++;
      }

      // 100번 시도 후에도 중복이면 사용 가능한 번호 찾기
      if (existingNumbers.has(queueNumber)) {
        for (let i = 1; i <= 999; i++) {
          if (!existingNumbers.has(i)) {
            queueNumber = i;
            break;
          }
        }
      }

      // 모든 번호가 사용 중이면 에러
      if (existingNumbers.has(queueNumber)) {
        throw new Error('사용 가능한 주문번호가 없습니다.');
      }

      // 새 주문 생성
      const { data: newQueue, error } = await supabase
        .from('queues')
        .insert({
          store_id: storeId,
          queue_number: queueNumber,
          status: 0,
        })
        .select()
        .single();

      if (error) {
        // 중복 시 재시도 (드물지만 동시 요청의 경우)
        if (error.code === '23505') {
          return handleGenerateQueue();
        }
        throw error;
      }

      // 주문 항목 추가
      if (selectedMenuItems.length > 0 && newQueue) {
        const queueItems: QueueItemInsert[] = selectedMenuItems.map((item) => ({
          queue_id: newQueue.queue_id,
          menu_id: item.menu.menu_id,
          menu_name: item.menu.name || '',
          quantity: item.quantity,
          price: item.menu.price || 0,
        }));

        const { error: itemsError } = await supabase
          .from('queue_items')
          .insert(queueItems);

        if (itemsError) {
          console.error('주문 항목 추가 실패:', JSON.stringify(itemsError, null, 2));
          console.error('실패한 데이터:', JSON.stringify(queueItems, null, 2));
          // 주문은 생성되었으나 항목 추가 실패 시 주문 삭제
          await supabase.from('queues').delete().eq('queue_id', newQueue.queue_id);
          throw new Error(`주문 항목 추가에 실패했습니다: ${itemsError.message || JSON.stringify(itemsError)}`);
        }
      }

      setIsMenuDialogOpen(false);
      setSelectedMenuItems([]);
      
      toast({
        title: '성공',
        description: `주문번호 #${String(queueNumber).padStart(3, '0')}가 생성되었습니다.`,
      });
    } catch (error) {
      console.error('주문번호 생성 실패:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '주문번호 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 준비 완료로 변경
  const handleMarkReady = async (queueId: number) => {
    const targetQueue = queues.find((queue) => queue.queue_id === queueId);

    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('queues')
        .update({ 
          status: 1,
          called_at: new Date().toISOString()
        })
        .eq('queue_id', queueId);

      if (error) throw error;

      if (targetQueue?.queue_number) {
        sendReadyNotification(targetQueue.queue_number);
      }

      toast({
        title: '성공',
        description: '주문이 준비 완료되었습니다.',
      });
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 완료로 변경
  const handleMarkComplete = async (queueId: number) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('queues')
        .update({ 
          status: 2,
          completed_at: new Date().toISOString()
        })
        .eq('queue_id', queueId);

      if (error) throw error;

      toast({
        title: '성공',
        description: '주문이 완료되었습니다.',
      });
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 삭제
  const handleDelete = async (queueId: number) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('queues')
        .delete()
        .eq('queue_id', queueId);

      if (error) throw error;

      // 실시간 구독이 작동하지 않을 수 있으므로 로컬 상태를 즉시 업데이트
      setQueues((prev) => prev.filter((q) => q.queue_id !== queueId));

      toast({
        title: '성공',
        description: '주문이 삭제되었습니다.',
      });
    } catch (error) {
      console.error('삭제 실패:', error);
      toast({
        title: '오류',
        description: '주문 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // 상태별 필터링
  const filteredQueues: FilteredQueues = {
    waiting: queues.filter(q => q.status === 0),
    ready: queues.filter(q => q.status === 1),
    completed: queues.filter(q => q.status === 2),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 총 가격 계산
  const totalPrice = selectedMenuItems.reduce(
    (sum, item) => sum + (item.menu.price || 0) * item.quantity,
    0
  );

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">주문 관리</h2>
        <Button
          onClick={handleOpenMenuDialog}
          disabled={actionLoading}
          className="w-full"
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          새 주문번호 생성
        </Button>
      </div>

      {/* 메뉴 선택 다이얼로그 */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>주문 메뉴 선택</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* 선택된 메뉴 목록 */}
            {selectedMenuItems.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">선택된 메뉴</h3>
                <div className="space-y-2">
                  {selectedMenuItems.map((item) => (
                    <div
                      key={item.menu.menu_id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.menu.name}</p>
                        <p className="text-sm text-gray-500">
                          {(item.menu.price || 0).toLocaleString()}원
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleChangeQuantity(item.menu.menu_id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleChangeQuantity(
                              item.menu.menu_id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleChangeQuantity(item.menu.menu_id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMenuItem(item.menu.menu_id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="ml-4 font-semibold">
                        {((item.menu.price || 0) * item.quantity).toLocaleString()}원
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                    <span>총 금액</span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            )}

            {/* 메뉴 목록 */}
            <div>
              <h3 className="font-semibold mb-3">메뉴 선택</h3>
              <div className="grid grid-cols-2 gap-3">
                {menus.map((menu) => (
                  <button
                    key={menu.menu_id}
                    onClick={() => handleAddMenuItem(menu)}
                    className="border rounded-lg p-3 text-left hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <p className="font-medium">{menu.name}</p>
                    <p className="text-sm text-gray-500">
                      {(menu.price || 0).toLocaleString()}원
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsMenuDialogOpen(false);
                setSelectedMenuItems([]);
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleGenerateQueue}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 빈 상태 */}
      {queues.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">주문이 없습니다</p>
          <p className="text-sm">위의 버튼을 클릭하여 새 주문을 생성하세요</p>
        </div>
      )}

      {/* 주문 목록 - 2열 레이아웃 */}
      {queues.length > 0 && (
        <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
          {/* 왼쪽: 대기 중 */}
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">
              대기 중 ({filteredQueues.waiting.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {filteredQueues.waiting.length > 0 ? (
                filteredQueues.waiting.map((queue) => (
                  <QueueCard
                    key={queue.queue_id}
                    queue={queue}
                    onMarkReady={handleMarkReady}
                    onMarkComplete={handleMarkComplete}
                    onDelete={handleDelete}
                    loading={actionLoading}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">대기 중인 주문이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 준비 완료 + 완료 */}
          <div className="flex flex-col overflow-hidden border-l pl-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">
              처리 완료 ({filteredQueues.ready.length + filteredQueues.completed.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {/* 준비 완료 */}
              {filteredQueues.ready.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    준비 완료 ({filteredQueues.ready.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredQueues.ready.map((queue) => (
                      <QueueCard
                        key={queue.queue_id}
                        queue={queue}
                        onMarkReady={handleMarkReady}
                        onMarkComplete={handleMarkComplete}
                        onDelete={handleDelete}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 완료 */}
              {filteredQueues.completed.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    완료 ({filteredQueues.completed.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredQueues.completed.map((queue) => (
                      <QueueCard
                        key={queue.queue_id}
                        queue={queue}
                        onMarkReady={handleMarkReady}
                        onMarkComplete={handleMarkComplete}
                        onDelete={handleDelete}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 처리 완료된 주문이 없을 때 */}
              {filteredQueues.ready.length === 0 && filteredQueues.completed.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">처리 완료된 주문이 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
