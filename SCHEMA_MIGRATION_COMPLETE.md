# 기존 스키마 활용 마이그레이션 완료

## 📊 마이그레이션 개요

**날짜**: 2025-10-13  
**상태**: ✅ 완료  
**목표**: 기존 Supabase 테이블(stores, menus)을 최대한 활용하여 필요한 컬럼만 추가

---

## 🔄 변경 사항

### 1. Stores 테이블
**기존 컬럼 활용:**
- `store_id` (PK) → 앱의 `id` 역할
- `name`, `description`, `phone` → 그대로 사용
- `logo_url` → `logo` 역할
- `created_at`, `updated_at` → 그대로 사용

**추가된 컬럼:**
- `user_id` (UUID) - Google OAuth 사용자 ID
- `business_hours` (TEXT) - 영업시간
- `notice` (TEXT) - 주의사항/공지사항

### 2. Menus 테이블
**기존 컬럼 활용:**
- `menu_id` (PK) → 앱의 `id` 역할
- `store_id`, `name`, `price` → 그대로 사용
- `is_active` → `is_available` 역할
- `image_url` → `image` 역할
- `created_at`, `updated_at` → 그대로 사용

**추가된 컬럼:**
- `category_id` (BIGINT) - 카테고리 참조
- `description` (TEXT) - 메뉴 상세 설명
- `allergy_info` (TEXT[]) - 알레르기 정보 배열
- `display_order` (INTEGER) - 표시 순서

### 3. Categories 테이블 (신규 생성)
- `category_id` (BIGINT, PK)
- `store_id` (BIGINT, FK)
- `name` (VARCHAR)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMPTZ)

### 4. QRCodes 테이블
**기존 컬럼 활용:**
- `qr_id`, `store_id`, `code`, `is_active`, `created_at`

**추가된 컬럼:**
- `table_number` (VARCHAR) - 테이블 번호

---

## 🔐 RLS (Row Level Security) 정책

모든 테이블에 RLS 정책이 적용되었습니다:

### Stores
- ✅ 사용자는 자신의 매장만 조회/수정/삭제 가능
- ✅ 사용자는 새 매장 생성 가능

### Categories
- ✅ 매장 소유자만 카테고리 관리 가능

### Menus
- ✅ 모든 사용자가 메뉴 조회 가능 (고객용)
- ✅ 매장 소유자만 메뉴 추가/수정/삭제 가능

### QRCodes
- ✅ 모든 사용자가 QR 코드 정보 조회 가능
- ✅ 매장 소유자만 QR 코드 관리 가능

---

## 📁 업데이트된 파일

### 1. 데이터베이스 관련
- ✅ `supabase/migrations/002_adapt_existing_schema.sql` - 마이그레이션 SQL
- ✅ `src/types/database.ts` - TypeScript 타입 정의 (bigint 사용)
- ✅ `src/lib/supabase-helpers.ts` - 헬퍼 함수 (새 스키마 반영)

### 2. 컴포넌트 & 페이지
- ✅ `src/app/(dashboard)/stores/page.tsx` - 매장 목록 페이지
- ✅ `src/app/(dashboard)/stores/new/page.tsx` - 매장 추가 페이지
- ✅ `src/app/(dashboard)/stores/[id]/edit/page.tsx` - 매장 수정 페이지
- ✅ `src/components/stores/store-card.tsx` - 매장 카드 컴포넌트
- ✅ `src/components/stores/store-form.tsx` - 매장 폼 컴포넌트
- ✅ `src/lib/mock-data.ts` - Mock 데이터 (개발용)

---

## 🔑 주요 필드명 매핑

| 설계서 | 실제 DB | 타입 | 설명 |
|--------|---------|------|------|
| `id` | `store_id` | bigint | 매장 ID |
| `id` | `menu_id` | bigint | 메뉴 ID |
| `id` | `category_id` | bigint | 카테고리 ID |
| `id` | `qr_id` | bigint | QR코드 ID |
| `logo` | `logo_url` | varchar | 로고 URL |
| `image` | `image_url` | varchar | 이미지 URL |
| `is_available` | `is_active` | boolean | 판매 가능 여부 |
| `display_order` | `display_order` | integer | 표시 순서 |

---

## ✅ 테스트 체크리스트

- [x] 마이그레이션 SQL 실행 성공
- [x] RLS 정책 적용 확인
- [x] TypeScript 타입 정의 업데이트
- [x] 헬퍼 함수 동작 확인
- [ ] 매장 CRUD 테스트
- [ ] 카테고리 CRUD 테스트
- [ ] 메뉴 CRUD 테스트
- [ ] QR 코드 생성 테스트

---

## 🚀 다음 단계

1. **매장 관리 기능 테스트**
   - 매장 추가/수정/삭제
   - 사용자 권한 확인

2. **카테고리 관리 구현**
   - 카테고리 CRUD 페이지 개발
   - 카테고리별 메뉴 분류

3. **메뉴 관리 구현**
   - 메뉴 CRUD 페이지 개발
   - 이미지 업로드 (Supabase Storage)
   - 알레르기 정보 입력

4. **QR 코드 생성**
   - QR 코드 생성 기능
   - 테이블별 QR 코드 관리

5. **고객용 페이지**
   - QR 스캔 후 메뉴 보기
   - 카테고리별 메뉴 필터링
   - 매장 정보 표시

---

## 📚 관련 문서

- `PRD.md` - 제품 요구사항 정의서
- `UI_Design_Specification.md` - UI 설계서
- `Development_Plan.md` - 개발 계획서
- `PHASE4_COMPLETE.md` - Phase 4 완료 보고서
- `PHASE5_COMPLETE.md` - Phase 5 완료 보고서

---

## 💡 참고사항

### bigint vs UUID
- 기존 테이블이 `bigint`를 PK로 사용하므로 이를 유지
- `user_id`만 UUID 사용 (auth.users.id 참조)
- TypeScript에서 `bigint`는 `number`로 처리

### 개발 모드
- Mock 데이터를 사용하여 Supabase 없이도 개발 가능
- `process.env.NODE_ENV === 'development'` 시 Mock 사용
- 실제 배포 시에는 Supabase 연결 필수

### 이미지 업로드
- 현재는 임시로 DataURL 사용
- **TODO**: Supabase Storage를 사용한 실제 이미지 업로드 구현 필요

