# Phase 4 완료: 데이터베이스 설계 및 구축

## ✅ 완료된 작업

### 1. 데이터베이스 스키마 설계 ✅
- **파일**: `PHASE4_DATABASE_SCHEMA.md`
- ERD (Entity Relationship Diagram) 작성
- 5개 테이블 상세 설계 완료

### 2. SQL 마이그레이션 작성 ✅
- **파일**: `supabase/migrations/001_initial_schema.sql`
- Users, Stores, Categories, Menus, Tables 테이블 생성
- 인덱스 설정
- Trigger 함수 (updated_at 자동 업데이트)
- RLS (Row Level Security) 정책 전체 구현

### 3. TypeScript 타입 정의 ✅
- **파일**: `src/types/database.ts`
- 모든 테이블의 타입 정의
- Insert/Update 타입 생성
- Database 전체 타입 구조 정의

### 4. Supabase 헬퍼 함수 작성 ✅
- **파일**: `src/lib/supabase-helpers.ts`
- Users: upsert, getByEmail, getByGoogleId
- Stores: CRUD 전체 구현
- Categories: CRUD 전체 구현
- Menus: CRUD + 품절 처리
- Tables: CRUD + 관계 조회

---

## ⚠️ 마이그레이션 적용 필요

현재 **Supabase 프로젝트가 일시 중지 상태**여서 마이그레이션을 적용하지 못했습니다.

### 마이그레이션 적용 방법

#### 1. Supabase 프로젝트 활성화
```
1. https://supabase.com/dashboard 접속
2. TableQR 프로젝트 선택
3. "Resume Project" 클릭
4. 1-2분 대기
```

#### 2. 마이그레이션 적용 (옵션 A: Supabase MCP 사용)
프로젝트 활성화 후, Cursor에서 다음 명령 실행:
```
"Supabase 마이그레이션 적용해줘"
```

#### 3. 마이그레이션 적용 (옵션 B: Dashboard 사용)
```
1. Supabase Dashboard → SQL Editor
2. supabase/migrations/001_initial_schema.sql 파일 내용 복사
3. SQL Editor에 붙여넣기
4. "Run" 버튼 클릭
```

#### 4. 마이그레이션 적용 (옵션 C: CLI 사용)
```bash
# Supabase CLI 설치 (선택사항)
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref zqfhqqtarpooqhjkyfmj

# 마이그레이션 적용
supabase db push
```

---

## 📊 데이터베이스 구조

### 테이블 목록
1. **users** - Google OAuth 사용자 정보
2. **stores** - 매장 정보 (멀티 스토어)
3. **categories** - 메뉴 카테고리
4. **menus** - 메뉴 정보
5. **tables** - 테이블 및 QR 코드

### ERD
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

## 🔒 보안 (RLS)

모든 테이블에 Row Level Security가 활성화되어 있습니다:

### Users
- 사용자는 자신의 정보만 조회/수정 가능

### Stores
- 사용자는 자신이 소유한 매장만 조회/수정/삭제 가능
- 인증된 사용자만 매장 생성 가능

### Categories
- 매장 소유자만 자신의 매장 카테고리를 관리 가능

### Menus
- **조회**: 모든 사용자 가능 (고객용)
- **생성/수정/삭제**: 매장 소유자만 가능

### Tables
- **조회**: 모든 사용자 가능 (QR 코드 스캔용)
- **생성/수정/삭제**: 매장 소유자만 가능

---

## 🧪 테스트 방법

### 1. 테이블 생성 확인
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 2. RLS 정책 확인
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. 샘플 데이터 삽입 (옵션)
```typescript
// src/lib/test-data.ts
import { upsertUser, createStore, createMenu } from '@/lib/supabase-helpers';

// 테스트 사용자 생성
const user = await upsertUser({
  email: 'test@example.com',
  google_id: 'test_google_id',
  name: 'Test User',
  profile_image: null,
});

// 테스트 매장 생성
const store = await createStore({
  user_id: user.id,
  name: '카페 모카',
  logo: null,
  phone: '010-1234-5678',
  business_hours: '09:00 - 22:00',
  notice: '주차 가능합니다',
  description: '따뜻한 분위기의 카페입니다',
});
```

---

## 📝 다음 단계 (Phase 5)

Phase 5에서는 이 데이터베이스를 활용하여:

1. **스토어 목록 페이지** - 사용자의 모든 매장 표시
2. **스토어 추가 기능** - 새 매장 생성 폼
3. **스토어 정보 입력/수정** - 매장 상세 정보 관리
4. **스토어 대시보드** - 매장별 관리 페이지

---

## 🎯 구현된 주요 기능

### ✅ 자동 타임스탬프
- `created_at`: 자동 생성
- `updated_at`: 자동 업데이트 (Trigger)

### ✅ Cascade 삭제
- 사용자 삭제 → 모든 매장 삭제
- 매장 삭제 → 카테고리, 메뉴, 테이블 모두 삭제
- 카테고리 삭제 → 메뉴의 category_id NULL 처리

### ✅ 관계 조회
- 메뉴 조회 시 카테고리 정보 포함
- 테이블 조회 시 매장 정보 포함

---

## 📚 참고 파일

- `PHASE4_DATABASE_SCHEMA.md` - 스키마 설계 문서
- `supabase/migrations/001_initial_schema.sql` - SQL 마이그레이션
- `src/types/database.ts` - TypeScript 타입
- `src/lib/supabase-helpers.ts` - 헬퍼 함수
- `src/lib/supabase.ts` - Supabase 클라이언트

---

## ⏰ 소요 시간
- 스키마 설계: 완료
- SQL 작성: 완료
- 타입 정의: 완료
- 헬퍼 함수: 완료
- **마이그레이션 적용**: 대기 중 (프로젝트 활성화 필요)

---

**프로젝트를 활성화하고 마이그레이션을 적용하면 Phase 4가 완료됩니다!** 🎉

