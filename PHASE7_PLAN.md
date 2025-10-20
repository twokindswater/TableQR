# Phase 7: 주문 대기번호(큐) 관리 시스템

## 📋 개요
매장에서 고객의 주문을 관리하기 위한 대기번호 시스템을 구현합니다. 
매장 관리자가 주문번호를 생성하고, 준비 완료 시 고객을 호출하며, 주문을 삭제할 수 있는 기능을 제공합니다.

## ✅ 구현할 기능

### 1. 주문번호 생성
- **위치**: 스토어 상세 페이지 (`/stores/[id]`)
- **기능**:
  - "주문번호 생성" 버튼 클릭
  - 자동으로 순차적 번호 생성 (001, 002, 003, ...)
  - 중복 방지: 해당 매장의 최신 번호 + 1
  - `queues` 테이블에 새 레코드 추가
  - 실시간으로 주문 목록에 표시

### 2. 주문 큐 관리 패널
- **위치**: 스토어 상세 페이지 오른쪽 사이드바
- **기능**:
  - 대기 중인 주문 목록 표시 (하얀색 배경)
  - 준비 완료된 주문 표시 (파란색 배경)
  - 완료된 주문 표시 (빨간색 배경)
  - 주문번호별 상태 관리
  - 실시간 업데이트 (Supabase Realtime)
  - 자동 삭제: 완료 상태(status=2) 후 1시간 경과 시 자동 삭제

### 3. 주문 상태 관리
- **상태 종류**:
  - `0`: 대기 중 (기본값)
  - `1`: 준비 완료
  - `2`: 완료
- **기능**:
  - 주문 카드 클릭 시 액션 메뉴 표시
  - "준비 완료" 버튼 → status를 1로 변경
  - "완료" 버튼 → status를 2로 변경
  - "삭제" 버튼 → 레코드 삭제
  - 상태 변경 시 시각적 피드백

### 4. 주문번호 표시
- **디자인**:
  - 큰 숫자로 주문번호 강조
  - 생성 시간 표시 (작게)
  - 대기 시간 표시 (실시간 카운터)
  - 상태별 색상 구분

## 🎨 UI/UX 설계

### 레이아웃 구조
```
+--------------------------------------------------------+
|                    스토어 정보                          |
|  - 매장명, 연락처, 영업시간                              |
|  - [주문번호 생성] 버튼                                  |
+--------------------------------------------------------+
|                                                        |
|  +----------+  +------------------+  +-------------+  |
|  |  카테고리  |  |     메뉴 목록      |  |  주문 큐    |  |
|  |  (1/5)   |  |     (3/5)        |  |  (1/5)     |  |
|  |          |  |                  |  |            |  |
|  | - 커피    |  | [메뉴 그리드]     |  | 대기 중:    |  |
|  | - 디저트  |  |                  |  | #005       |  |
|  | - 음료    |  |                  |  | #004       |  |
|  |          |  |                  |  | #003       |  |
|  | [+ 추가]  |  | [+ 메뉴 추가]     |  |            |  |
|  |          |  |                  |  | 준비 완료:  |  |
|  |          |  |                  |  | #002 ✓     |  |
|  |          |  |                  |  | #001 ✓     |  |
|  |          |  |                  |  |            |  |
|  |          |  |                  |  | [새 주문]   |  |
|  +----------+  +------------------+  +-------------+  |
|                                                        |
+--------------------------------------------------------+
```

### 주문 카드 디자인

#### 대기 중 상태 (status: 0)
```
+---------------------------+
|  🔔 #005                  |
|  ------------------       |
|  대기 시간: 3분 15초        |
|  생성: 14:32              |
|                           |
|  [준비 완료] [삭제]        |
+---------------------------+
색상: 회색 테두리, 하얀색 배경
```

#### 준비 완료 상태 (status: 1)
```
+---------------------------+
|  ✅ #002                  |
|  ------------------       |
|  준비 시간: 14:25          |
|  대기 시간: 5분 30초        |
|                           |
|  [완료] [삭제]             |
+---------------------------+
색상: 파란색 테두리, 연한 파란색 배경
```

#### 완료 상태 (status: 2)
```
+---------------------------+
|  ✔️ #001                  |
|  ------------------       |
|  완료 시간: 14:20          |
|  총 시간: 8분 45초          |
|  1시간 후 자동 삭제         |
|                           |
|  [삭제]                   |
+---------------------------+
색상: 빨간색 테두리, 연한 빨간색 배경
```

### 주문번호 생성 버튼
```
+---------------------------+
|  📋 새 주문번호 생성       |
+---------------------------+
- 위치: 스토어 정보 카드 우측 상단
- 크기: 중간 (md)
- 색상: Primary (보라색)
- 아이콘: Plus + Queue
```

## 📊 데이터베이스 스키마

### queues 테이블
```sql
CREATE TABLE queues (
  queue_id BIGSERIAL PRIMARY KEY,
  store_id BIGINT REFERENCES stores(store_id) ON DELETE CASCADE,
  queue_number BIGINT NOT NULL,
  status SMALLINT NOT NULL DEFAULT 0,
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_queues_store_id ON queues(store_id);
CREATE INDEX idx_queues_status ON queues(store_id, status);
CREATE INDEX idx_queues_created_at ON queues(created_at DESC);
CREATE INDEX idx_queues_completed_at ON queues(completed_at) WHERE completed_at IS NOT NULL;

-- 유니크 제약: 동일 매장 내 주문번호 중복 방지
CREATE UNIQUE INDEX idx_queues_store_number ON queues(store_id, queue_number);
```

### 주요 필드 설명
- `queue_id`: 고유 식별자
- `store_id`: 매장 ID (FK)
- `queue_number`: 주문번호 (순차 생성, 중복 불가)
- `status`: 0=대기중, 1=준비완료, 2=완료
- `called_at`: 준비 완료 시각 (status → 1)
- `completed_at`: 픽업 완료 시각 (status → 2)
- `created_at`: 주문 생성 시각

### 자동 삭제 정책
- 완료 상태(status=2)가 된 후 1시간 경과 시 자동 삭제
- 구현 방법: 
  1. Supabase Edge Function (cron job)
  2. 또는 클라이언트 사이드에서 주기적 체크

## 🔐 권한 관리

### RLS 정책 (이미 적용됨)
```sql
-- 매장 소유자만 조회 가능
CREATE POLICY "Store owners can view queues"
  ON queues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = queues.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- 매장 소유자만 생성 가능
CREATE POLICY "Store owners can create queues"
  ON queues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = queues.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- 매장 소유자만 업데이트 가능
CREATE POLICY "Store owners can update queues"
  ON queues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = queues.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- 매장 소유자만 삭제 가능
CREATE POLICY "Store owners can delete queues"
  ON queues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = queues.store_id
      AND stores.user_id = auth.uid()
    )
  );
```

## 📝 구현 순서

### 1단계: 컴포넌트 구조 설계
- [ ] `src/components/queues/queue-panel.tsx` - 주문 큐 패널
- [ ] `src/components/queues/queue-card.tsx` - 개별 주문 카드
- [ ] `src/components/queues/queue-actions.tsx` - 액션 버튼 그룹
- [ ] `src/types/queue.ts` - 타입 정의

### 2단계: 주문번호 생성 기능
- [ ] 주문번호 생성 버튼 추가
- [ ] 최신 queue_number 조회 로직
- [ ] 새 주문 생성 API 호출
- [ ] 낙관적 업데이트 구현
- [ ] 에러 핸들링

### 3단계: 주문 목록 표시
- [ ] 주문 큐 패널 컴포넌트
- [ ] 대기 중/완료 주문 필터링
- [ ] 실시간 대기 시간 표시
- [ ] 스크롤 가능한 목록
- [ ] 빈 상태 UI

### 4단계: 주문 상태 관리
- [ ] 준비 완료 버튼 구현 (0 → 1)
- [ ] 완료 버튼 구현 (1 → 2)
- [ ] 주문 삭제 버튼 구현
- [ ] 상태 업데이트 API (called_at, completed_at)
- [ ] 삭제 확인 다이얼로그
- [ ] 상태별 시각적 피드백
- [ ] 자동 삭제 로직 구현 (5분마다 체크)

### 5단계: 실시간 기능
- [ ] Supabase Realtime 구독 설정
- [ ] 새 주문 실시간 추가
- [ ] 상태 변경 실시간 반영
- [ ] 삭제 실시간 동기화
- [ ] 연결 상태 표시

### 6단계: UI 개선
- [ ] 애니메이션 추가 (새 주문 등장)
- [ ] 사운드 알림 (선택 사항)
- [ ] 키보드 단축키
- [ ] 모바일 반응형 최적화
- [ ] 다크 모드 지원

## 🎯 주요 기능 상세

### 1. 주문번호 생성 로직
```typescript
async function generateQueueNumber(storeId: number) {
  try {
    // 1. 해당 매장의 최신 주문번호 조회 (중복 방지)
    const { data: latestQueue } = await supabase
      .from('queues')
      .select('queue_number')
      .eq('store_id', storeId)
      .order('queue_number', { ascending: false })
      .limit(1);

    // 2. 다음 번호 생성 (001부터 시작, 순차 증가)
    const nextNumber = latestQueue?.[0]?.queue_number 
      ? latestQueue[0].queue_number + 1 
      : 1;

    // 3. 999 초과 시 1로 리셋 (순환)
    const queueNumber = nextNumber > 999 ? 1 : nextNumber;

    // 4. 새 주문 생성 (UNIQUE 제약으로 중복 방지)
    const { data, error } = await supabase
      .from('queues')
      .insert({
        store_id: storeId,
        queue_number: queueNumber,
        status: 0,
      })
      .select()
      .single();

    if (error) {
      // 중복 시 재시도 (매우 드문 경우)
      if (error.code === '23505') {
        return generateQueueNumber(storeId);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('주문번호 생성 실패:', error);
    throw error;
  }
}
```

### 2. 실시간 업데이트 구독
```typescript
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
          setQueues((prev) => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setQueues((prev) =>
            prev.map((q) =>
              q.queue_id === payload.new.queue_id ? payload.new : q
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setQueues((prev) =>
            prev.filter((q) => q.queue_id !== payload.old.queue_id)
          );
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [storeId]);
```

### 3. 대기 시간 계산
```typescript
function useWaitingTime(createdAt: string) {
  const [waitingTime, setWaitingTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const created = new Date(createdAt);
      const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
      
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      
      setWaitingTime(`${minutes}분 ${seconds}초`);
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return waitingTime;
}
```

### 4. 자동 삭제 로직
```typescript
// 방법 1: 클라이언트 사이드 구현
useEffect(() => {
  const checkExpiredQueues = async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { error } = await supabase
      .from('queues')
      .delete()
      .eq('store_id', storeId)
      .eq('status', 2)
      .lt('completed_at', oneHourAgo.toISOString());
    
    if (error) {
      console.error('자동 삭제 실패:', error);
    }
  };

  // 5분마다 체크
  const interval = setInterval(checkExpiredQueues, 5 * 60 * 1000);
  
  // 초기 실행
  checkExpiredQueues();
  
  return () => clearInterval(interval);
}, [storeId]);

// 방법 2: Supabase Edge Function (cron job)
// supabase/functions/clean-old-queues/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('queues')
    .delete()
    .eq('status', 2)
    .lt('completed_at', oneHourAgo.toISOString())

  return new Response(
    JSON.stringify({ deleted: data?.length || 0, error }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### 5. 상태 변경 핸들러
```typescript
// 준비 완료로 변경
async function handleMarkReady(queueId: number) {
  const { error } = await supabase
    .from('queues')
    .update({ 
      status: 1,
      called_at: new Date().toISOString()
    })
    .eq('queue_id', queueId);

  if (error) throw error;
}

// 완료로 변경
async function handleMarkComplete(queueId: number) {
  const { error } = await supabase
    .from('queues')
    .update({ 
      status: 2,
      completed_at: new Date().toISOString()
    })
    .eq('queue_id', queueId);

  if (error) throw error;
}

// 삭제
async function handleDelete(queueId: number) {
  const { error } = await supabase
    .from('queues')
    .delete()
    .eq('queue_id', queueId);

  if (error) throw error;
}
```

## 🧪 테스트 시나리오

### 1. 주문번호 생성
```
1. "새 주문번호 생성" 버튼 클릭
2. 주문번호가 자동 생성됨 (001)
3. 주문 목록에 즉시 표시
4. 대기 시간이 실시간으로 증가
```

### 2. 주문 준비 완료
```
1. 대기 중인 주문 카드의 "준비 완료" 버튼 클릭
2. status가 0 → 1로 변경
3. called_at 필드에 현재 시간 저장
4. 카드 색상이 파란색으로 변경
5. "준비 완료" 섹션으로 이동
6. 버튼이 [완료] [삭제]로 변경
```

### 3. 주문 완료
```
1. 준비 완료 주문 카드의 "완료" 버튼 클릭
2. status가 1 → 2로 변경
3. completed_at 필드에 현재 시간 저장
4. 카드 색상이 빨간색으로 변경
5. "완료" 섹션으로 이동
6. "1시간 후 자동 삭제" 메시지 표시
7. 1시간 후 자동으로 DB에서 삭제
```

### 4. 주문 삭제
```
1. 주문 카드의 "삭제" 버튼 클릭
2. 확인 다이얼로그 표시
3. "삭제" 확인
4. 목록에서 즉시 제거
```

### 5. 자동 삭제
```
1. 완료 상태(status=2)가 된 주문
2. completed_at으로부터 1시간 경과 확인
3. 5분마다 자동으로 체크
4. 조건 만족 시 자동 삭제
5. 실시간으로 목록에서 제거
```

### 6. 실시간 동기화
```
1. 두 개의 브라우저 탭 열기
2. 첫 번째 탭에서 주문 생성
3. 두 번째 탭에서 즉시 표시 확인
4. 한 탭에서 상태 변경 (대기 → 준비 → 완료)
5. 다른 탭에서 실시간 반영 확인
6. 자동 삭제도 모든 탭에서 동시 반영
```

## 📱 반응형 디자인

### 데스크톱 (≥1024px)
- 3단 레이아웃: 카테고리 | 메뉴 | 주문 큐
- 주문 큐 고정 너비 (280px)
- 모든 기능 표시

### 태블릿 (768px - 1023px)
- 2단 레이아웃: 메뉴 | 주문 큐
- 카테고리는 드롭다운으로 변경
- 주문 큐 너비 축소 (240px)

### 모바일 (<768px)
- 1단 레이아웃
- 주문 큐는 하단 시트로 표시
- "주문 보기" 버튼으로 토글
- 풀스크린 오버레이

## 🎨 색상 스키마

### 상태별 색상
```
대기 중 (status: 0):
- Border: gray-300 (#d1d5db)
- Background: white (#ffffff)
- Text: gray-900 (#111827)
- Icon: 🔔

준비 완료 (status: 1):
- Border: blue-500 (#3b82f6)
- Background: blue-50 (#eff6ff)
- Text: gray-900 (#111827)
- Icon: ✅

완료 (status: 2):
- Border: red-500 (#ef4444)
- Background: red-50 (#fef2f2)
- Text: gray-900 (#111827)
- Icon: ✔️

주문번호:
- Font: text-3xl font-bold
- Color: primary (purple-600 #7c3aed)
```

## 🔄 상태 관리

### React State 구조
```typescript
interface Queue {
  queue_id: number;
  store_id: number;
  queue_number: number;
  status: 0 | 1 | 2;
  called_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface QueueState {
  queues: Queue[];
  loading: boolean;
  error: string | null;
}

// 상태별 필터링을 위한 타입
type QueueStatus = 0 | 1 | 2;

interface FilteredQueues {
  waiting: Queue[];      // status: 0
  ready: Queue[];        // status: 1
  completed: Queue[];    // status: 2
}
```

## 📈 성능 최적화

### 1. 가상 스크롤
- 주문이 많을 경우 react-window 사용
- 한 번에 10-20개만 렌더링

### 2. 메모이제이션
- Queue 카드는 React.memo로 래핑
- 대기 시간 계산은 useMemo 사용

### 3. 실시간 업데이트 최적화
- 불필요한 리렌더링 방지
- 낙관적 업데이트 적용

## 🎯 다음 단계 (Phase 8 준비)
- 주문 히스토리 및 통계
- 주문 알림 시스템 (사운드, 진동)
- QR 코드와 연동
- 고객 대시보드 (주문 조회)
- 프린터 연동 (영수증 출력)

---

**시작하기 전 체크리스트:**
- [x] queues 테이블 확인
- [ ] RLS 정책 설정 확인
- [ ] 컴포넌트 구조 설계
- [ ] 실시간 기능 테스트
- [ ] UI/UX 프로토타입

**예상 작업 시간:**
- 기본 기능: 4-6시간
- 실시간 기능: 2-3시간
- UI/UX 개선: 2-3시간
- 테스트 및 버그 수정: 2-3시간
- **총 예상 시간: 10-15시간**

