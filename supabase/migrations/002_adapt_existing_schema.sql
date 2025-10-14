-- TableQR Schema Adaptation
-- 기존 테이블(stores, menus)을 활용하여 필요한 컬럼 추가
-- Created: 2025-10-13

-- =====================================================
-- 1. Stores 테이블에 컬럼 추가
-- =====================================================

-- user_id 컬럼 추가 (accounts 테이블의 auth_user_id 참조)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS user_id UUID;

-- accounts 테이블에서 user_id 채우기 (기존 데이터가 있는 경우)
UPDATE stores s
SET user_id = a.auth_user_id
FROM accounts a
WHERE a.store_id = s.store_id
AND s.user_id IS NULL;

-- business_hours 컬럼 추가
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_hours TEXT;

-- notice 컬럼 추가 (주의사항)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS notice TEXT;

-- 컬럼 코멘트 추가
COMMENT ON COLUMN stores.user_id IS '매장 소유자 ID (auth.users.id)';
COMMENT ON COLUMN stores.business_hours IS '영업시간';
COMMENT ON COLUMN stores.notice IS '주의사항/공지사항';

-- =====================================================
-- 2. Categories 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  category_id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories 인덱스
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(store_id, display_order);

COMMENT ON TABLE categories IS '메뉴 카테고리';

-- =====================================================
-- 3. Menus 테이블에 컬럼 추가
-- =====================================================

-- category_id 컬럼 추가
ALTER TABLE menus ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(category_id) ON DELETE SET NULL;

-- description 컬럼 추가 (메뉴 설명)
ALTER TABLE menus ADD COLUMN IF NOT EXISTS description TEXT;

-- allergy_info 컬럼 추가 (알레르기 정보 배열)
ALTER TABLE menus ADD COLUMN IF NOT EXISTS allergy_info TEXT[];

-- display_order 컬럼 추가 (표시 순서)
ALTER TABLE menus ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_menus_category_id ON menus(category_id);
CREATE INDEX IF NOT EXISTS idx_menus_order ON menus(store_id, display_order);

-- 컬럼 코멘트 추가
COMMENT ON COLUMN menus.category_id IS '메뉴 카테고리 ID';
COMMENT ON COLUMN menus.description IS '메뉴 상세 설명';
COMMENT ON COLUMN menus.allergy_info IS '알레르기 유발 성분';
COMMENT ON COLUMN menus.display_order IS '메뉴 표시 순서';

-- =====================================================
-- 4. QR Codes 테이블 수정 (tables 역할)
-- =====================================================

-- table_number 컬럼 추가 (기존 code 활용 가능하지만 명확성을 위해 추가)
ALTER TABLE qrcodes ADD COLUMN IF NOT EXISTS table_number VARCHAR(50);

-- code 컬럼을 고유하게 만들기
CREATE UNIQUE INDEX IF NOT EXISTS idx_qrcodes_code_unique ON qrcodes(code) WHERE code IS NOT NULL;

-- store별로 table_number 고유하게
CREATE UNIQUE INDEX IF NOT EXISTS idx_qrcodes_store_table_unique ON qrcodes(store_id, table_number) WHERE table_number IS NOT NULL;

COMMENT ON COLUMN qrcodes.table_number IS '테이블 번호';

-- =====================================================
-- 5. RLS 정책 업데이트
-- =====================================================

-- Stores RLS 정책
DROP POLICY IF EXISTS "Users can view own stores" ON stores;
CREATE POLICY "Users can view own stores"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stores" ON stores;
CREATE POLICY "Users can insert own stores"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stores" ON stores;
CREATE POLICY "Users can update own stores"
  ON stores FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stores" ON stores;
CREATE POLICY "Users can delete own stores"
  ON stores FOR DELETE
  USING (auth.uid() = user_id);

-- Categories RLS 정책
DROP POLICY IF EXISTS "Store owners can view categories" ON categories;
CREATE POLICY "Store owners can view categories"
  ON categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = categories.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can insert categories" ON categories;
CREATE POLICY "Store owners can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = categories.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can update categories" ON categories;
CREATE POLICY "Store owners can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = categories.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can delete categories" ON categories;
CREATE POLICY "Store owners can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = categories.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Menus RLS 정책 (기존 유지 + 소유자 권한 추가)
DROP POLICY IF EXISTS "Anyone can view menus" ON menus;
CREATE POLICY "Anyone can view menus"
  ON menus FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Store owners can insert menus" ON menus;
CREATE POLICY "Store owners can insert menus"
  ON menus FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = menus.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can update menus" ON menus;
CREATE POLICY "Store owners can update menus"
  ON menus FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = menus.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can delete menus" ON menus;
CREATE POLICY "Store owners can delete menus"
  ON menus FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = menus.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- QRCodes RLS 정책
DROP POLICY IF EXISTS "Anyone can view qrcodes" ON qrcodes;
CREATE POLICY "Anyone can view qrcodes"
  ON qrcodes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Store owners can manage qrcodes" ON qrcodes;
CREATE POLICY "Store owners can manage qrcodes"
  ON qrcodes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.store_id = qrcodes.store_id
      AND stores.user_id = auth.uid()
    )
  );

