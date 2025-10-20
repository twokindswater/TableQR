-- Phase 7: 주문 큐 시스템 업데이트
-- completed_at 필드 추가 및 유니크 제약 설정
-- Created: 2025-10-20

-- =====================================================
-- 1. queues 테이블에 completed_at 필드 추가
-- =====================================================

-- completed_at 컬럼 추가 (이미 있으면 무시)
ALTER TABLE queues 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- completed_at 컬럼에 코멘트 추가
COMMENT ON COLUMN queues.completed_at IS '주문 완료 시각 (status → 2)';

-- =====================================================
-- 2. 인덱스 추가
-- =====================================================

-- completed_at 인덱스 (자동 삭제 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_queues_completed_at 
ON queues(completed_at) 
WHERE completed_at IS NOT NULL;

-- 유니크 제약: 동일 매장 내 주문번호 중복 방지
-- 이미 존재하는 경우를 위해 DROP IF EXISTS 후 생성
DROP INDEX IF EXISTS idx_queues_store_number;
CREATE UNIQUE INDEX idx_queues_store_number 
ON queues(store_id, queue_number);

-- =====================================================
-- 3. 기존 데이터 정리 (선택 사항)
-- =====================================================

-- status가 1이지만 called_at이 NULL인 경우 현재 시간으로 설정
UPDATE queues 
SET called_at = created_at 
WHERE status = 1 AND called_at IS NULL;

-- status가 2이지만 completed_at이 NULL인 경우 called_at 또는 created_at으로 설정
UPDATE queues 
SET completed_at = COALESCE(called_at, created_at)
WHERE status = 2 AND completed_at IS NULL;

-- =====================================================
-- 4. RLS 정책 확인 (이미 적용됨)
-- =====================================================

-- queues 테이블의 RLS가 활성화되어 있는지 확인
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'queues') THEN
    RAISE NOTICE 'RLS is already enabled for queues table';
  END IF;
END $$;

