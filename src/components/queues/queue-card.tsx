'use client';

import { useEffect, useState, memo } from 'react';
import { Queue, QUEUE_STATUS_MAP } from '@/types/queue';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash } from 'lucide-react';

interface QueueCardProps {
  queue: Queue;
  onMarkReady: (queueId: number) => Promise<void>;
  onMarkComplete: (queueId: number) => Promise<void>;
  onDelete: (queueId: number) => Promise<void>;
  loading?: boolean;
}

function QueueCardComponent({ queue, onMarkReady, onMarkComplete, onDelete, loading }: QueueCardProps) {
  const [waitingTime, setWaitingTime] = useState('');
  const statusInfo = QUEUE_STATUS_MAP[queue.status as 0 | 1 | 2];

  // 대기 시간 계산
  useEffect(() => {
    const updateWaitingTime = () => {
      const now = new Date();
      const created = new Date(queue.created_at);
      const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      if (hours > 0) {
        setWaitingTime(`${hours}시간 ${minutes}분`);
      } else {
        setWaitingTime(`${minutes}분 ${seconds}초`);
      }
    };

    updateWaitingTime();
    const interval = setInterval(updateWaitingTime, 1000);

    return () => clearInterval(interval);
  }, [queue.created_at]);

  // 자동 삭제까지 남은 시간 계산 (완료 상태일 때)
  const [autoDeleteTime, setAutoDeleteTime] = useState('');
  
  useEffect(() => {
    if (queue.status === 2 && queue.completed_at) {
      const updateAutoDeleteTime = () => {
        const now = new Date();
        const completed = new Date(queue.completed_at!);
        const oneHourLater = new Date(completed.getTime() + 60 * 60 * 1000);
        const diff = Math.floor((oneHourLater.getTime() - now.getTime()) / 1000);
        
        if (diff <= 0) {
          setAutoDeleteTime('곧 삭제됩니다');
        } else {
          const minutes = Math.floor(diff / 60);
          setAutoDeleteTime(`${minutes}분 후 자동 삭제`);
        }
      };

      updateAutoDeleteTime();
      const interval = setInterval(updateAutoDeleteTime, 60000); // 1분마다 업데이트

      return () => clearInterval(interval);
    }
  }, [queue.status, queue.completed_at]);

  // 생성 시간 포맷
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`relative border-2 rounded-lg p-4 ${statusInfo.bgColor} ${statusInfo.borderColor} transition-all hover:shadow-md`}>
      {/* 주문번호 */}
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

      {/* 시간 정보 */}
      <div className="space-y-1 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">대기 시간:</span>
          <span className="font-semibold">{waitingTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">생성:</span>
          <span className="text-gray-500">{formatTime(queue.created_at)}</span>
        </div>
        {queue.status === 1 && queue.called_at && (
          <div className="flex justify-between">
            <span className="text-gray-600">준비:</span>
            <span className="text-gray-500">{formatTime(queue.called_at)}</span>
          </div>
        )}
        {queue.status === 2 && queue.completed_at && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">완료:</span>
              <span className="text-gray-500">{formatTime(queue.completed_at)}</span>
            </div>
            <div className="flex justify-between text-red-600 font-semibold mt-2">
              <span>🕐</span>
              <span>{autoDeleteTime}</span>
            </div>
          </>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        {queue.status === 0 && (
          <>
            <Button
              onClick={() => onMarkReady(queue.queue_id)}
              disabled={loading}
              size="sm"
              className="flex-1"
            >
              준비 완료
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
                  <AlertDialogTitle>주문 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    #{String(queue.queue_number).padStart(3, '0')} 주문을 삭제하시겠습니까?
                    이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(queue.queue_id)}>
                    삭제
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
              완료
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
                  <AlertDialogTitle>주문 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    #{String(queue.queue_number).padStart(3, '0')} 주문을 삭제하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(queue.queue_id)}>
                    삭제
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
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>주문 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  #{String(queue.queue_number).padStart(3, '0')} 주문을 삭제하시겠습니까?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(queue.queue_id)}>
                  삭제
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

