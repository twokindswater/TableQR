# Phase 6: 메뉴 관리 기능 구현 계획

## ✅ 구현할 기능

### 1. 스토어 대시보드 페이지
- **파일**: `src/app/(dashboard)/stores/[id]/page.tsx`
- **기능**:
  - 스토어 기본 정보 표시
  - 메뉴 카테고리 목록
  - 메뉴 목록 (카테고리별)
  - 통계 정보 (준비중)

### 2. 메뉴 카테고리 관리
- **파일**: `src/components/menus/category-list.tsx`
- **기능**:
  - 카테고리 목록 표시
  - 카테고리 추가/수정/삭제
  - 카테고리 순서 변경 (드래그 앤 드롭)
  - 카테고리별 메뉴 개수 표시

### 3. 메뉴 관리
- **파일**: `src/components/menus/menu-list.tsx`
- **기능**:
  - 메뉴 목록 표시 (그리드 레이아웃)
  - 메뉴 추가/수정/삭제
  - 메뉴 순서 변경
  - 메뉴 품절 관리
  - 메뉴 이미지 관리

### 4. 메뉴 폼 컴포넌트
- **파일**: `src/components/menus/menu-form.tsx`
- **기능**:
  - 메뉴 정보 입력/수정
  - 이미지 업로드 및 미리보기
  - 카테고리 선택
  - 가격 입력
  - 메뉴 설명
  - 옵션 관리 (준비중)

## 📊 데이터베이스 스키마

### 카테고리 테이블 (categories)
\`\`\`sql
CREATE TABLE categories (
  category_id BIGSERIAL PRIMARY KEY,
  store_id BIGINT REFERENCES stores(store_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
\`\`\`

### 메뉴 테이블 (menus)
\`\`\`sql
CREATE TABLE menus (
  menu_id BIGSERIAL PRIMARY KEY,
  store_id BIGINT REFERENCES stores(store_id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
\`\`\`

## 🎨 UI/UX 설계

### 1. 대시보드 레이아웃
\`\`\`
+------------------+
|    스토어 정보    |
+------------------+
|  카테고리 관리    |
+------------------+
|    메뉴 목록     |
|  (카테고리별)    |
+------------------+
\`\`\`

### 2. 메뉴 카드 디자인
\`\`\`
+------------------+
|    메뉴 이미지    |
+------------------+
|    메뉴 이름     |
|    가격         |
|    설명         |
+------------------+
|  수정 / 삭제     |
|  품절 토글      |
+------------------+
\`\`\`

## 🔐 권한 관리

### Supabase RLS 정책
1. 카테고리 테이블
   - 조회: 스토어 소유자 또는 공개 메뉴
   - 수정: 스토어 소유자만
   - 삭제: 스토어 소유자만

2. 메뉴 테이블
   - 조회: 스토어 소유자 또는 공개 메뉴
   - 수정: 스토어 소유자만
   - 삭제: 스토어 소유자만

## 📝 구현 순서

### 1단계: 기본 구조
- [ ] 스토어 대시보드 페이지 생성
- [ ] 카테고리 컴포넌트 구현
- [ ] 메뉴 컴포넌트 구현
- [ ] 데이터베이스 마이그레이션

### 2단계: 카테고리 관리
- [ ] 카테고리 목록 표시
- [ ] 카테고리 추가 기능
- [ ] 카테고리 수정/삭제
- [ ] 카테고리 순서 변경

### 3단계: 메뉴 관리
- [ ] 메뉴 목록 표시
- [ ] 메뉴 추가 폼
- [ ] 메뉴 수정/삭제
- [ ] 메뉴 이미지 업로드

### 4단계: 고급 기능
- [ ] 메뉴 순서 변경
- [ ] 메뉴 품절 관리
- [ ] 실시간 미리보기
- [ ] 성능 최적화

## 🧪 테스트 계획

### 1. 카테고리 관리
\`\`\`
1. 카테고리 추가
   - 이름 입력
   - 설명 입력 (선택)
   - 추가 버튼 클릭
   - 목록 업데이트 확인

2. 카테고리 수정
   - 수정 버튼 클릭
   - 정보 수정
   - 저장 확인

3. 카테고리 삭제
   - 삭제 버튼 클릭
   - 확인 대화상자
   - 삭제 후 목록 업데이트
\`\`\`

### 2. 메뉴 관리
\`\`\`
1. 메뉴 추가
   - 카테고리 선택
   - 메뉴 정보 입력
   - 이미지 업로드
   - 저장 및 확인

2. 메뉴 수정
   - 기존 정보 표시
   - 정보 수정
   - 이미지 변경
   - 저장 확인

3. 메뉴 삭제
   - 삭제 확인
   - 목록 업데이트
\`\`\`

## 🎯 다음 단계 (Phase 7 준비)
- QR 코드 생성
- 테이블 관리
- 주문 관리 시스템

---

**시작하기 전 준비사항:**
1. Supabase 테이블 생성
2. Storage 버킷 설정 (메뉴 이미지용)
3. RLS 정책 설정
4. 컴포넌트 구조 설계

이 문서는 구현 과정에서 계속 업데이트됩니다.
