'use client';

import { useEffect, useState, memo } from 'react';
import { QueueWithItems, QUEUE_STATUS_MAP } from '@/types/queue';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash } from 'lucide-react';

interface QueueCardProps {
  queue: QueueWithItems;
  onMarkReady: (queueId: number) => Promise<void>;
  onMarkComplete: (queueId: number) => Promise<void>;
  onDelete: (queueId: number) => Promise<void>;
  loading?: boolean;
}

function QueueCardComponent({ queue, onMarkReady, onMarkComplete, onDelete, loading }: QueueCardProps) {
  const [waitingTime, setWaitingTime] = useState('');
  const statusInfo = QUEUE_STATUS_MAP[queue.status as 0 | 1 | 2];

  // Calculate waiting time
  useEffect(() => {
    const updateWaitingTime = () => {
      const now = new Date();
      const created = new Date(queue.created_at);
      const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      if (hours > 0) {
        setWaitingTime(`${hours}h ${minutes}m`);
      } else {
        setWaitingTime(`${minutes}m ${seconds}s`);
      }
    };

    updateWaitingTime();
    const interval = setInterval(updateWaitingTime, 1000);

    return () => clearInterval(interval);
  }, [queue.created_at]);

  // Calculate time until auto-delete (when completed)
  const [autoDeleteTime, setAutoDeleteTime] = useState('');
  
  useEffect(() => {
    if (queue.status === 2 && queue.completed_at) {
      const updateAutoDeleteTime = () => {
        const now = new Date();
        const completed = new Date(queue.completed_at!);
        const oneHourLater = new Date(completed.getTime() + 60 * 60 * 1000);
        const diff = Math.floor((oneHourLater.getTime() - now.getTime()) / 1000);
        
        if (diff <= 0) {
          setAutoDeleteTime('Will be deleted soon');
        } else {
          const minutes = Math.floor(diff / 60);
          setAutoDeleteTime(`Auto delete in ${minutes} minutes`);
        }
      };

      updateAutoDeleteTime();
      const interval = setInterval(updateAutoDeleteTime, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [queue.status, queue.completed_at]);

  // Format creation time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`relative border-2 rounded-lg p-4 ${statusInfo.bgColor} ${statusInfo.borderColor} transition-all hover:shadow-md`}>
      {/* Order number */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{statusInfo.icon}</span>
          <span className="text-3xl font-bold text-purple-600">
            #{String(queue.queue_number).padStart(3, '0')}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Time information */}
      <div className="space-y-1 mb-4 text-sm">
        {/* Show waiting time only when not completed */}
        {queue.status !== 2 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Waiting Time:</span>
            <span className="font-semibold">{waitingTime}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Created:</span>
          <span className="text-gray-500">{formatTime(queue.created_at)}</span>
        </div>
        {queue.status === 1 && queue.called_at && (
          <div className="flex justify-between">
            <span className="text-gray-600">Ready:</span>
            <span className="text-gray-500">{formatTime(queue.called_at)}</span>
          </div>
        )}
        {queue.status === 2 && queue.completed_at && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="text-gray-500">{formatTime(queue.completed_at)}</span>
            </div>
            <div className="flex justify-between text-red-600 font-semibold mt-2">
              <span>🕐</span>
              <span>{autoDeleteTime}</span>
            </div>
          </>
        )}
      </div>

      {/* Order items */}
      {queue.items && queue.items.length > 0 && (
        <div className="mb-4 border-t pt-3">
          <p className="text-xs text-gray-600 font-semibold mb-2">Order Items</p>
          <div className="space-y-1">
            {queue.items.map((item) => (
              <div key={item.queue_item_id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.menu_name} x {item.quantity}
                </span>
                <span className="text-gray-600">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold pt-1 border-t">
              <span>Total</span>
              <span>
                ${queue.items
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {queue.status === 0 && (
          <>
            <Button
              onClick={() => onMarkReady(queue.queue_id)}
              disabled={loading}
              size="sm"
              className="flex-1"
            >
              Mark Ready
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete order #{String(queue.queue_number).padStart(3, '0')}?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(queue.queue_id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        {queue.status === 1 && (
          <>
            <Button
              onClick={() => onMarkComplete(queue.queue_id)}
              disabled={loading}
              size="sm"
              className="flex-1"
            >
              Mark Complete
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete order #{String(queue.queue_number).padStart(3, '0')}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(queue.queue_id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        {queue.status === 2 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                className="w-full text-red-600 hover:text-red-700"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete order #${String(queue.queue_number).padStart(3, '0')}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(queue.queue_id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export const QueueCard = memo(QueueCardComponent);

