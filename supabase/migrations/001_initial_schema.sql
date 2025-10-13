-- TableQR Initial Database Schema
-- Phase 4: 데이터베이스 설계 및 구축
-- Created: 2025-10-12

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Users Table (사용자)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users 인덱스
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

COMMENT ON TABLE users IS 'Google OAuth 인증 사용자 정보';

-- =====================================================
-- 2. Stores Table (매장)
-- =====================================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  logo TEXT,
  phone VARCHAR(50),
  business_hours TEXT,
  notice TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores 인덱스
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);

COMMENT ON TABLE stores IS '사용자가 소유한 매장 정보 (멀티 스토어)';

-- =====================================================
-- 3. Categories Table (카테고리)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories 인덱스
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(store_id, display_order);

COMMENT ON TABLE categories IS '매장의 메뉴 카테고리';

-- =====================================================
-- 4. Menus Table (메뉴)
-- =====================================================
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image TEXT,
  allergy_info TEXT[],
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menus 인덱스
CREATE INDEX IF NOT EXISTS idx_menus_store_id ON menus(store_id);
CREATE INDEX IF NOT EXISTS idx_menus_category_id ON menus(category_id);
CREATE INDEX IF NOT EXISTS idx_menus_order ON menus(store_id, display_order);
CREATE INDEX IF NOT EXISTS idx_menus_available ON menus(store_id, is_available);

COMMENT ON TABLE menus IS '매장의 메뉴 정보';

-- =====================================================
-- 5. Tables (테이블/QR코드)
-- =====================================================
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  table_number VARCHAR(50) NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, table_number)
);

-- Tables 인덱스
CREATE INDEX IF NOT EXISTS idx_tables_store_id ON tables(store_id);

COMMENT ON TABLE tables IS '매장의 테이블 및 QR 코드 정보';

-- =====================================================
-- 6. Trigger Function: updated_at 자동 업데이트
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. Triggers 적용
-- =====================================================
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. Row Level Security (RLS) 활성화
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. RLS Policies - Users
-- =====================================================
-- 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- 사용자는 자신의 정보만 수정 가능
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- =====================================================
-- 10. RLS Policies - Stores
-- =====================================================
-- 사용자는 자신의 매장만 조회 가능
CREATE POLICY "Users can view own stores"
  ON stores FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- 사용자는 매장을 생성할 수 있음
CREATE POLICY "Users can create stores"
  ON stores FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- 사용자는 자신의 매장만 수정 가능
CREATE POLICY "Users can update own stores"
  ON stores FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- 사용자는 자신의 매장만 삭제 가능
CREATE POLICY "Users can delete own stores"
  ON stores FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- =====================================================
-- 11. RLS Policies - Categories
-- =====================================================
-- 매장 소유자는 카테고리 조회 가능
CREATE POLICY "Store owners can view categories"
  ON categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = categories.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- 매장 소유자는 카테고리 생성 가능
CREATE POLICY "Store owners can create categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = categories.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- 매장 소유자는 카테고리 수정 가능
CREATE POLICY "Store owners can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = categories.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- 매장 소유자는 카테고리 삭제 가능
CREATE POLICY "Store owners can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = categories.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- =====================================================
-- 12. RLS Policies - Menus
-- =====================================================
-- 모든 사용자는 메뉴 조회 가능 (고객용)
CREATE POLICY "Anyone can view available menus"
  ON menus FOR SELECT
  USING (true);

-- 매장 소유자는 메뉴 생성 가능
CREATE POLICY "Store owners can create menus"
  ON menus FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = menus.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- 매장 소유자는 메뉴 수정 가능
CREATE POLICY "Store owners can update menus"
  ON menus FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = menus.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- 매장 소유자는 메뉴 삭제 가능
CREATE POLICY "Store owners can delete menus"
  ON menus FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = menus.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- =====================================================
-- 13. RLS Policies - Tables
-- =====================================================
-- 모든 사용자는 테이블 정보 조회 가능 (QR 코드 스캔)
CREATE POLICY "Anyone can view tables"
  ON tables FOR SELECT
  USING (true);

-- 매장 소유자는 테이블 생성 가능
CREATE POLICY "Store owners can create tables"
  ON tables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = tables.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- 매장 소유자는 테이블 수정 가능
CREATE POLICY "Store owners can update tables"
  ON tables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = tables.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- 매장 소유자는 테이블 삭제 가능
CREATE POLICY "Store owners can delete tables"
  ON tables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = tables.store_id
      AND stores.user_id::text = auth.uid()::text
    )
  );

