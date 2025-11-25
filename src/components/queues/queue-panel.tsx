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
        console.error('Failed to update notification status:', error);
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
          title: 'Order Ready',
          body: `Order #${formattedQueueNumber} is ready.`,
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
        console.warn('Failed to parse FCM response:', error);
      }
    }

    if (!response.ok) {
      const fallbackMessage = rawBody || 'FCM request failed.';
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

  // Send ready notification
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
            title: 'Some Push Notifications Failed',
            description: 'Some push notifications failed. Please check the retry list.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to send ready notification:', error);

        if (recipients.length > 0) {
          await updateNotificationStatus(
            recipients.map(({ id }) => id),
            'failure',
            attemptTimestamp,
          );
        }

        toast({
          title: 'Notification Failed',
          description: 'Failed to send push notification. Please check the logs.',
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

  // Load queue data (including order items)
  const loadQueues = useCallback(async () => {
    try {
      const { data: queuesData, error: queuesError } = await supabase
        .from('queues')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (queuesError) throw queuesError;

      // Load items for each queue
      const queuesWithItems: QueueWithItems[] = await Promise.all(
        (queuesData || []).map(async (queue) => {
          const { data: items, error: itemsError } = await supabase
            .from('queue_items')
            .select('*')
            .eq('queue_id', queue.queue_id)
            .order('created_at', { ascending: true });

          if (itemsError) {
            console.error('Failed to load order items:', itemsError);
            return { ...queue, items: [] };
          }

          return { ...queue, items: items || [] };
        })
      );

      setQueues(queuesWithItems);
    } catch (error) {
      console.error('Failed to load order list:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order list.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, toast]);

  // Load menu data
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
      console.error('Failed to load menus:', error);
    }
  }, [storeId]);

  // Initial load
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
            // Load items for new queue
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

  // Auto-delete check (every 5 minutes)
  useEffect(() => {
    const checkExpiredQueues = async () => {
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const oneHourAgoISO = oneHourAgo.toISOString();
        
        // Delete items with status 1 (ready) where called_at is more than 1 hour ago
        const { error: error1 } = await supabase
          .from('queues')
          .delete()
          .eq('store_id', storeId)
          .eq('status', 1)
          .lt('called_at', oneHourAgoISO);
        
        if (error1 && error1.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Auto-delete failed (ready):', error1);
        }
        
        // Delete items with status 2 (completed) where completed_at is more than 1 hour ago
        const { error: error2 } = await supabase
          .from('queues')
          .delete()
          .eq('store_id', storeId)
          .eq('status', 2)
          .lt('completed_at', oneHourAgoISO);
        
        if (error2 && error2.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Auto-delete failed (completed):', error2);
        }
      } catch (error) {
        console.error('Auto-delete check failed:', error);
      }
    };

    // Initial execution
    checkExpiredQueues();
    
    // Execute every 5 minutes
    const interval = setInterval(checkExpiredQueues, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [storeId]);

  // Open menu selection dialog
  const handleOpenMenuDialog = () => {
    if (menus.length === 0) {
      toast({
        title: 'Notice',
        description: 'No menus registered. Please register menus first.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedMenuItems([]);
    setIsMenuDialogOpen(true);
  };

  // Add menu item
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

  // Change menu quantity
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

  // Remove menu item
  const handleRemoveMenuItem = (menuId: number) => {
    setSelectedMenuItems(selectedMenuItems.filter((item) => item.menu.menu_id !== menuId));
  };

  // Create new order (with menu items)
  const handleGenerateQueue = async () => {
    try {
      setActionLoading(true);

      // Generate random 3-digit number (1-999)
      const generateRandomNumber = () => Math.floor(Math.random() * 999) + 1;

      // Query existing queue numbers
      const { data: existingQueues } = await supabase
        .from('queues')
        .select('queue_number')
        .eq('store_id', storeId);

      const existingNumbers = new Set(
        existingQueues?.map((q) => q.queue_number) || []
      );

      // Find non-duplicate random number (max 100 attempts)
      let queueNumber = generateRandomNumber();
      let attempts = 0;
      const maxAttempts = 100;

      while (existingNumbers.has(queueNumber) && attempts < maxAttempts) {
        queueNumber = generateRandomNumber();
        attempts++;
      }

      // If still duplicate after 100 attempts, find available number
      if (existingNumbers.has(queueNumber)) {
        for (let i = 1; i <= 999; i++) {
          if (!existingNumbers.has(i)) {
            queueNumber = i;
            break;
          }
        }
      }

      // If all numbers are in use, throw error
      if (existingNumbers.has(queueNumber)) {
        throw new Error('No available queue numbers.');
      }

      // Create new order
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
        // Retry on duplicate (rare but possible with concurrent requests)
        if (error.code === '23505') {
          return handleGenerateQueue();
        }
        throw error;
      }

      // Add order items
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
          console.error('Failed to add order items:', JSON.stringify(itemsError, null, 2));
          console.error('Failed data:', JSON.stringify(queueItems, null, 2));
          // If order was created but items failed, delete the order
          await supabase.from('queues').delete().eq('queue_id', newQueue.queue_id);
          throw new Error(`Failed to add order items: ${itemsError.message || JSON.stringify(itemsError)}`);
        }
      }

      setIsMenuDialogOpen(false);
      setSelectedMenuItems([]);
      
      toast({
        title: 'Success',
        description: `Order #${String(queueNumber).padStart(3, '0')} has been created.`,
      });
    } catch (error) {
      console.error('Failed to generate queue number:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate queue number.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Mark as ready
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
        title: 'Success',
        description: 'Order has been marked as ready.',
      });
    } catch (error) {
      console.error('Failed to change status:', error);
      toast({
        title: 'Error',
        description: 'Failed to change status.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Mark as complete
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
        title: 'Success',
        description: 'Order has been completed.',
      });
    } catch (error) {
      console.error('Failed to change status:', error);
      toast({
        title: 'Error',
        description: 'Failed to change status.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const handleDelete = async (queueId: number) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('queues')
        .delete()
        .eq('queue_id', queueId);

      if (error) throw error;

      // Update local state immediately in case real-time subscription doesn't work
      setQueues((prev) => prev.filter((q) => q.queue_id !== queueId));

      toast({
        title: 'Success',
        description: 'Order has been deleted.',
      });
    } catch (error) {
      console.error('Failed to delete:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete order.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter by status
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

  // Calculate total price
  const totalPrice = selectedMenuItems.reduce(
    (sum, item) => sum + (item.menu.price || 0) * item.quantity,
    0
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Order Management</h2>
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
          Generate New Order Number
        </Button>
      </div>

      {/* Menu selection dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Order Items</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Selected menu items */}
            {selectedMenuItems.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Selected Items</h3>
                <div className="space-y-2">
                  {selectedMenuItems.map((item) => (
                    <div
                      key={item.menu.menu_id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.menu.name}</p>
                        <p className="text-sm text-gray-500">
                          ${(item.menu.price || 0).toLocaleString()}
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
                        ${((item.menu.price || 0) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Menu list */}
            <div>
              <h3 className="font-semibold mb-3">Select Menu</h3>
              <div className="grid grid-cols-2 gap-3">
                {menus.map((menu) => (
                  <button
                    key={menu.menu_id}
                    onClick={() => handleAddMenuItem(menu)}
                    className="border rounded-lg p-3 text-left hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <p className="font-medium">{menu.name}</p>
                    <p className="text-sm text-gray-500">
                      ${(menu.price || 0).toLocaleString()}
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
              Cancel
            </Button>
            <Button
              onClick={handleGenerateQueue}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty state */}
      {queues.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">No orders</p>
          <p className="text-sm">Click the button above to create a new order</p>
        </div>
      )}

      {/* Order list - 2 column layout */}
      {queues.length > 0 && (
        <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
          {/* Left: Waiting */}
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">
              Waiting ({filteredQueues.waiting.length})
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
                  <p className="text-sm">No waiting orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Ready + Completed */}
          <div className="flex flex-col overflow-hidden border-l pl-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">
              Processed ({filteredQueues.ready.length + filteredQueues.completed.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {/* Ready */}
              {filteredQueues.ready.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Ready ({filteredQueues.ready.length})
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

              {/* Completed */}
              {filteredQueues.completed.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Completed ({filteredQueues.completed.length})
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

              {/* No processed orders */}
              {filteredQueues.ready.length === 0 && filteredQueues.completed.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No processed orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
