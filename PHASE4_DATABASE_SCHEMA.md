# Phase 4: 데이터베이스 스키마 설계

## 📋 개요

TableQR 서비스를 위한 Supabase PostgreSQL 데이터베이스 스키마 설계 문서입니다.

---

## 🗄️ 데이터베이스 구조

### 엔티티 관계도 (ERD)

```
User (사용자)
  ↓ 1:N
Store (매장)
  ↓ 1:N
  ├─→ Category (카테고리)
  │     ↓ 1:N
  │   Menu (메뉴)
  │
  └─→ Table (테이블/QR코드)
```

---

## 📊 테이블 상세 설계

### 1. Users (사용자)

Google OAuth 인증 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PRIMARY KEY | 사용자 고유 ID |
| email | varchar | UNIQUE, NOT NULL | 이메일 (Gmail) |
| google_id | varchar | UNIQUE, NOT NULL | Google OAuth ID |
| name | varchar | NOT NULL | 사용자 이름 |
| profile_image | text | NULL | 프로필 이미지 URL |
| created_at | timestamptz | DEFAULT now() | 생성 시간 |
| updated_at | timestamptz | DEFAULT now() | 수정 시간 |

**인덱스:**
- `idx_users_email` ON (email)
- `idx_users_google_id` ON (google_id)

---

### 2. Stores (매장)

각 사용자가 소유한 매장 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PRIMARY KEY | 매장 고유 ID |
| user_id | uuid | FK(users.id), NOT NULL | 소유자 ID |
| name | varchar | NOT NULL | 매장명 |
| logo | text | NULL | 로고 이미지 URL |
| phone | varchar | NULL | 연락처 |
| business_hours | text | NULL | 영업시간 |
| notice | text | NULL | 주의사항 |
| description | text | NULL | 매장 소개 |
| created_at | timestamptz | DEFAULT now() | 생성 시간 |
| updated_at | timestamptz | DEFAULT now() | 수정 시간 |

**인덱스:**
- `idx_stores_user_id` ON (user_id)

**제약조건:**
- ON DELETE CASCADE (사용자 삭제 시 매장도 삭제)

---

### 3. Categories (카테고리)

매장의 메뉴 카테고리를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PRIMARY KEY | 카테고리 고유 ID |
| store_id | uuid | FK(stores.id), NOT NULL | 매장 ID |
| name | varchar | NOT NULL | 카테고리명 |
| display_order | integer | DEFAULT 0 | 표시 순서 |
| created_at | timestamptz | DEFAULT now() | 생성 시간 |

**인덱스:**
- `idx_categories_store_id` ON (store_id)
- `idx_categories_order` ON (store_id, display_order)

**제약조건:**
- ON DELETE CASCADE (매장 삭제 시 카테고리도 삭제)

---

### 4. Menus (메뉴)

매장의 메뉴 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PRIMARY KEY | 메뉴 고유 ID |
| store_id | uuid | FK(stores.id), NOT NULL | 매장 ID |
| category_id | uuid | FK(categories.id), NULL | 카테고리 ID |
| name | varchar | NOT NULL | 메뉴명 |
| price | integer | NOT NULL | 가격 |
| description | text | NULL | 메뉴 설명 |
| image | text | NULL | 메뉴 이미지 URL |
| allergy_info | text[] | NULL | 알레르기 정보 |
| is_available | boolean | DEFAULT true | 판매 가능 여부 |
| display_order | integer | DEFAULT 0 | 표시 순서 |
| created_at | timestamptz | DEFAULT now() | 생성 시간 |
| updated_at | timestamptz | DEFAULT now() | 수정 시간 |

**인덱스:**
- `idx_menus_store_id` ON (store_id)
- `idx_menus_category_id` ON (category_id)
- `idx_menus_order` ON (store_id, display_order)
- `idx_menus_available` ON (store_id, is_available)

**제약조건:**
- ON DELETE CASCADE (매장 삭제 시 메뉴도 삭제)
- ON DELETE SET NULL (카테고리 삭제 시 category_id를 NULL로)

---

### 5. Tables (테이블/QR코드)

매장의 테이블 및 QR 코드 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PRIMARY KEY | 테이블 고유 ID |
| store_id | uuid | FK(stores.id), NOT NULL | 매장 ID |
| table_number | varchar | NOT NULL | 테이블 번호 |
| qr_code_url | text | NULL | QR 코드 이미지 URL |
| created_at | timestamptz | DEFAULT now() | 생성 시간 |

**인덱스:**
- `idx_tables_store_id` ON (store_id)

**제약조건:**
- UNIQUE (store_id, table_number)
- ON DELETE CASCADE (매장 삭제 시 테이블도 삭제)

---

## 🔒 Row Level Security (RLS) 정책

### Users 테이블
- 사용자는 자신의 정보만 조회/수정 가능

### Stores 테이블
- 사용자는 자신이 소유한 매장만 조회/수정/삭제 가능
- 매장 생성은 인증된 사용자만 가능

### Categories 테이블
- 사용자는 자신의 매장에 속한 카테고리만 조회/수정/삭제 가능
- 카테고리 생성은 매장 소유자만 가능

### Menus 테이블
- **조회**: 모든 사용자 가능 (고객용)
- **수정/삭제**: 매장 소유자만 가능
- **생성**: 매장 소유자만 가능

### Tables 테이블
- **조회**: 모든 사용자 가능 (QR 코드 스캔)
- **수정/삭제**: 매장 소유자만 가능
- **생성**: 매장 소유자만 가능

---

## 🔄 자동 업데이트 트리거

### updated_at 자동 업데이트

Users, Stores, Menus 테이블의 `updated_at` 컬럼을 자동으로 업데이트하는 트리거를 설정합니다.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

---

## 📝 마이그레이션 순서

1. **Extension 활성화** (uuid-ossp)
2. **Users 테이블 생성**
3. **Stores 테이블 생성**
4. **Categories 테이블 생성**
5. **Menus 테이블 생성**
6. **Tables 테이블 생성**
7. **Trigger 함수 생성** (updated_at)
8. **Trigger 적용**
9. **RLS 활성화**
10. **RLS 정책 생성**

---

## 🎯 다음 단계

1. SQL 마이그레이션 스크립트 실행
2. Supabase Dashboard에서 테이블 확인
3. RLS 정책 테스트
4. TypeScript 타입 생성
5. Supabase 클라이언트 함수 작성

