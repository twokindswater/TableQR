-- Phase 8: 주문 항목 테이블 추가
-- queue_items 테이블 생성하여 주문에 포함된 메뉴 정보 저장
-- Created: 2025-11-25

-- =====================================================
-- 1. queue_items 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS queue_items (
  queue_item_id BIGSERIAL PRIMARY KEY,
  queue_id BIGINT NOT NULL REFERENCES queues(queue_id) ON DELETE CASCADE,
  menu_id BIGINT NOT NULL REFERENCES menus(menu_id) ON DELETE CASCADE,
  menu_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 테이블 코멘트
COMMENT ON TABLE queue_items IS '주문 항목 정보 (주문에 포함된 메뉴들)';
COMMENT ON COLUMN queue_items.queue_item_id IS '주문 항목 ID (Primary Key)';
COMMENT ON COLUMN queue_items.queue_id IS '주문 ID (Foreign Key to queues)';
COMMENT ON COLUMN queue_items.menu_id IS '메뉴 ID (Foreign Key to menus)';
COMMENT ON COLUMN queue_items.menu_name IS '메뉴명 (주문 시점의 메뉴 이름 저장)';
COMMENT ON COLUMN queue_items.quantity IS '수량';
COMMENT ON COLUMN queue_items.price IS '가격 (주문 시점의 가격 저장)';
COMMENT ON COLUMN queue_items.created_at IS '생성 시각';

-- =====================================================
-- 2. 인덱스 추가
-- =====================================================

-- queue_id 인덱스 (특정 주문의 항목 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_queue_items_queue_id 
ON queue_items(queue_id);

-- menu_id 인덱스 (메뉴별 주문 통계 최적화)
CREATE INDEX IF NOT EXISTS idx_queue_items_menu_id 
ON queue_items(menu_id);

-- =====================================================
-- 3. RLS (Row Level Security) 정책 설정
-- =====================================================

-- RLS 활성화
ALTER TABLE queue_items ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 자신의 매장 주문 항목만 조회 가능
CREATE POLICY "Users can view their store queue items"
ON queue_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM queues q
    JOIN stores s ON q.store_id = s.store_id
    WHERE q.queue_id = queue_items.queue_id
    AND s.user_id = auth.uid()
  )
);

-- 인증된 사용자는 자신의 매장 주문 항목 추가 가능
CREATE POLICY "Users can insert their store queue items"
ON queue_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM queues q
    JOIN stores s ON q.store_id = s.store_id
    WHERE q.queue_id = queue_items.queue_id
    AND s.user_id = auth.uid()
  )
);

-- 인증된 사용자는 자신의 매장 주문 항목 수정 가능
CREATE POLICY "Users can update their store queue items"
ON queue_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM queues q
    JOIN stores s ON q.store_id = s.store_id
    WHERE q.queue_id = queue_items.queue_id
    AND s.user_id = auth.uid()
  )
);

-- 인증된 사용자는 자신의 매장 주문 항목 삭제 가능
CREATE POLICY "Users can delete their store queue items"
ON queue_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM queues q
    JOIN stores s ON q.store_id = s.store_id
    WHERE q.queue_id = queue_items.queue_id
    AND s.user_id = auth.uid()
  )
);

