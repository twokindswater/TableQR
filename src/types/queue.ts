import { Tables, TablesInsert, TablesUpdate } from './database.generated';

// Queue 테이블 타입
export type Queue = Tables<'queues'>;

// Queue 상태 타입
export type QueueStatus = 0 | 1 | 2;

// Queue 생성 타입
export type QueueInsert = {
  store_id: number;
  queue_number: number;
  status?: QueueStatus;
};

// Queue 업데이트 타입
export type QueueUpdate = {
  status?: QueueStatus;
  called_at?: string;
  completed_at?: string;
};

// Queue 알림 토큰 타입
export type QueueNotification = Tables<'queue_notifications'>;
export type QueueNotificationInsert = TablesInsert<'queue_notifications'>;
export type QueueNotificationUpdate = TablesUpdate<'queue_notifications'>;

// 상태별 필터링된 Queue
export interface FilteredQueues {
  waiting: Queue[];      // status: 0 - 대기 중
  ready: Queue[];        // status: 1 - 준비 완료
  completed: Queue[];    // status: 2 - 완료
}

// Queue 상태 정보
export interface QueueStatusInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

// Queue 상태별 정보 맵
export const QUEUE_STATUS_MAP: Record<QueueStatus, QueueStatusInfo> = {
  0: {
    label: '대기 중',
    color: 'text-gray-900',
    bgColor: 'bg-white',
    borderColor: 'border-gray-300',
    icon: '🔔',
  },
  1: {
    label: '준비 완료',
    color: 'text-gray-900',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    icon: '✅',
  },
  2: {
    label: '완료',
    color: 'text-gray-900',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    icon: '✔️',
  },
};
