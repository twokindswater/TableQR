'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Queue, FilteredQueues, QueueNotification } from '@/types/queue';
import { QueueCard } from './queue-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';

interface QueuePanelProps {
  storeId: number;
}

export function QueuePanel({ storeId }: QueuePanelProps) {
  const { toast } = useToast();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Queue 데이터 로드
  const loadQueues = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueues(data || []);
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

  // 초기 로드
  useEffect(() => {
    loadQueues();
  }, [loadQueues]);

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
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setQueues((prev) => [payload.new as Queue, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setQueues((prev) =>
              prev.map((q) =>
                q.queue_id === (payload.new as Queue).queue_id ? (payload.new as Queue) : q
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
        
        const { error } = await supabase
          .from('queues')
          .delete()
          .eq('store_id', storeId)
          .eq('status', 2)
          .lt('completed_at', oneHourAgo.toISOString());
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('자동 삭제 실패:', error);
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

  // 새 주문 생성
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
      const { error } = await supabase
        .from('queues')
        .insert({
          store_id: storeId,
          queue_number: queueNumber,
          status: 0,
        });

      if (error) {
        // 중복 시 재시도 (드물지만 동시 요청의 경우)
        if (error.code === '23505') {
          return handleGenerateQueue();
        }
        throw error;
      }

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

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">주문 관리</h2>
        <Button
          onClick={handleGenerateQueue}
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
