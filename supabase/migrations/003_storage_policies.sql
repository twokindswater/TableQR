-- TableQR Storage Policies
-- Supabase Storage 버킷에 대한 RLS 정책 설정
-- Created: 2025-10-20

-- =====================================================
-- 1. Storage 버킷 생성 (이미 생성된 경우 무시됨)
-- =====================================================

-- store-logos 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-logos', 'store-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- menu-images 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- =====================================================
-- 2. store-logos 버킷 정책
-- =====================================================

-- 모든 인증된 사용자가 자신의 매장 로고를 업로드할 수 있음
DROP POLICY IF EXISTS "Authenticated users can upload store logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload store logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'store-logos'
  );

-- 모든 사용자가 매장 로고를 조회할 수 있음 (public 버킷)
DROP POLICY IF EXISTS "Anyone can view store logos" ON storage.objects;
CREATE POLICY "Anyone can view store logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'store-logos');

-- 인증된 사용자가 자신이 업로드한 로고를 수정할 수 있음
DROP POLICY IF EXISTS "Users can update their store logos" ON storage.objects;
CREATE POLICY "Users can update their store logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'store-logos' AND
    auth.uid() = owner
  );

-- 인증된 사용자가 자신이 업로드한 로고를 삭제할 수 있음
DROP POLICY IF EXISTS "Users can delete their store logos" ON storage.objects;
CREATE POLICY "Users can delete their store logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'store-logos' AND
    auth.uid() = owner
  );

-- =====================================================
-- 3. menu-images 버킷 정책
-- =====================================================

-- 모든 인증된 사용자가 메뉴 이미지를 업로드할 수 있음
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
CREATE POLICY "Authenticated users can upload menu images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'menu-images'
  );

-- 모든 사용자가 메뉴 이미지를 조회할 수 있음 (public 버킷)
DROP POLICY IF EXISTS "Anyone can view menu images" ON storage.objects;
CREATE POLICY "Anyone can view menu images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'menu-images');

-- 인증된 사용자가 자신이 업로드한 이미지를 수정할 수 있음
DROP POLICY IF EXISTS "Users can update their menu images" ON storage.objects;
CREATE POLICY "Users can update their menu images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'menu-images' AND
    auth.uid() = owner
  );

-- 인증된 사용자가 자신이 업로드한 이미지를 삭제할 수 있음
DROP POLICY IF EXISTS "Users can delete their menu images" ON storage.objects;
CREATE POLICY "Users can delete their menu images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'menu-images' AND
    auth.uid() = owner
  );

