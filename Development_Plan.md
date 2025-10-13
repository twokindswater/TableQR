# TableQR - 개발 계획서 (Development Plan)

## 문서 정보
- **버전**: 1.0
- **작성일**: 2025년 10월 12일
- **관련 문서**: PRD.md, UI_Design_Specification.md
- **목적**: 체계적인 개발 로드맵 및 실행 계획

---

## 1. 기술 스택 결정

### 1.1 프론트엔드
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Shadcn/ui
- **아이콘**: Lucide Icons
- **폼 관리**: React Hook Form + Zod
- **상태 관리**: Zustand
- **이미지**: Next/Image (최적화)

### 1.2 백엔드 (Phase 1 - 간단한 구조)
- **API**: Next.js API Routes (서버리스)
- **데이터베이스**: Supabase (PostgreSQL + Auth + Storage)
- **인증**: NextAuth.js (Google Provider)
- **이미지 저장**: Supabase Storage
- **QR 코드**: qrcode library

### 1.3 배포
- **호스팅**: Vercel
- **데이터베이스**: Supabase Cloud
- **도메인**: 추후 설정

---

## 2. 개발 단계 (Phase)

### Phase 1: 프로젝트 초기 설정 및 기본 구조 (1-2일)
- [x] 기술 스택 결정
- [ ] Next.js 프로젝트 생성
- [ ] 필수 패키지 설치
- [ ] 프로젝트 폴더 구조 설정
- [ ] Tailwind CSS 설정
- [ ] TypeScript 설정
- [ ] 환경 변수 설정

### Phase 2: 디자인 시스템 구축 (2-3일)
- [ ] 색상 시스템 (Tailwind 커스텀)
- [ ] 타이포그래피 설정
- [ ] 공통 UI 컴포넌트
  - [ ] Button
  - [ ] Input
  - [ ] Card
  - [ ] Modal
  - [ ] Toast
  - [ ] Badge
- [ ] Layout 컴포넌트

### Phase 3: 인증 시스템 (2-3일)
- [ ] Supabase 프로젝트 생성
- [ ] NextAuth.js 설정
- [ ] Google OAuth 연동
- [ ] 로그인 페이지 UI
- [ ] 인증 미들웨어
- [ ] 사용자 세션 관리

### Phase 4: 데이터베이스 설계 및 구축 (1-2일)
- [ ] Supabase 테이블 생성
  - [ ] users
  - [ ] stores
  - [ ] categories
  - [ ] menus
  - [ ] tables (QR)
- [ ] RLS (Row Level Security) 정책
- [ ] API 라우트 기본 구조

### Phase 5: 멀티 스토어 관리 (3-4일)
- [ ] 가게 목록 페이지
  - [ ] 가게 카드 컴포넌트
  - [ ] 빈 상태 (Empty State)
  - [ ] "+ 가게 추가" 기능
- [ ] 가게 추가/수정 페이지
  - [ ] 폼 UI
  - [ ] 이미지 업로드
  - [ ] 유효성 검사
  - [ ] API 연동
- [ ] 가게 삭제 기능

### Phase 6: 가게 관리 대시보드 (2-3일)
- [ ] 대시보드 레이아웃
- [ ] 탭 네비게이션
- [ ] 매장 정보 탭
- [ ] 통계 표시 (기본)
- [ ] 빠른 액션 버튼

### Phase 7: 메뉴 관리 시스템 (4-5일)
- [ ] 카테고리 관리
  - [ ] 카테고리 CRUD
  - [ ] 카테고리 필터
- [ ] 메뉴 목록 페이지
  - [ ] 메뉴 카드 컴포넌트
  - [ ] 리스트/그리드 뷰
  - [ ] 검색 기능
- [ ] 메뉴 추가/수정 모달
  - [ ] 폼 UI
  - [ ] 이미지 업로드
  - [ ] 카테고리 선택
  - [ ] 품절 상태 관리
- [ ] 메뉴 삭제 기능
- [ ] 메뉴 정렬 (드래그 앤 드롭)

### Phase 8: QR 코드 시스템 (3-4일)
- [ ] QR 코드 생성 라이브러리 통합
- [ ] 테이블 관리
  - [ ] 테이블 추가/수정/삭제
  - [ ] 테이블 목록
- [ ] QR 코드 생성
  - [ ] URL 구조 설정
  - [ ] PNG/SVG 다운로드
  - [ ] 인쇄용 템플릿
- [ ] QR 코드 관리 페이지

### Phase 9: 고객용 메뉴 페이지 (3-4일)
- [ ] 공개 페이지 라우팅
- [ ] 매장 정보 헤더
- [ ] 카테고리 탭 (Sticky)
- [ ] 메뉴 그리드
  - [ ] 메뉴 카드
  - [ ] 품절 표시
  - [ ] 이미지 레이지 로딩
- [ ] 메뉴 상세 모달
- [ ] 모바일 최적화

### Phase 10: 테스트 및 최적화 (3-4일)
- [ ] 반응형 테스트
- [ ] 브라우저 호환성 테스트
- [ ] 성능 최적화
  - [ ] 이미지 최적화
  - [ ] 코드 스플리팅
  - [ ] 로딩 상태
- [ ] 접근성 개선
- [ ] 에러 핸들링

### Phase 11: 배포 및 출시 (1-2일)
- [ ] Vercel 배포 설정
- [ ] 환경 변수 설정
- [ ] 도메인 연결
- [ ] SSL 인증서
- [ ] 모니터링 설정

---

## 3. 프로젝트 폴더 구조

```
/TableQR
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 관련 페이지
│   │   │   └── login/
│   │   ├── (dashboard)/       # 대시보드 레이아웃
│   │   │   ├── stores/        # 가게 목록
│   │   │   └── store/
│   │   │       └── [storeId]/ # 가게 관리
│   │   │           ├── page.tsx      # 대시보드
│   │   │           ├── menus/        # 메뉴 관리
│   │   │           ├── qrcodes/      # QR 코드
│   │   │           └── settings/     # 설정
│   │   ├── menu/              # 고객용 메뉴
│   │   │   └── [storeId]/
│   │   │       └── [tableId]/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── stores/
│   │   │   ├── menus/
│   │   │   └── qrcodes/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # 컴포넌트
│   │   ├── ui/               # 공통 UI 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── toast.tsx
│   │   │   └── badge.tsx
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   ├── store/            # 가게 관련
│   │   │   ├── store-card.tsx
│   │   │   ├── store-form.tsx
│   │   │   └── store-list.tsx
│   │   ├── menu/             # 메뉴 관련
│   │   │   ├── menu-card.tsx
│   │   │   ├── menu-form.tsx
│   │   │   ├── menu-list.tsx
│   │   │   └── category-filter.tsx
│   │   └── qrcode/           # QR 코드 관련
│   │       ├── qrcode-card.tsx
│   │       ├── qrcode-generator.tsx
│   │       └── qrcode-download.tsx
│   ├── lib/                  # 유틸리티 함수
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── validators.ts
│   ├── hooks/                # Custom Hooks
│   │   ├── use-store.ts
│   │   ├── use-menu.ts
│   │   └── use-toast.ts
│   ├── store/                # Zustand Store
│   │   ├── auth-store.ts
│   │   ├── store-store.ts
│   │   └── ui-store.ts
│   ├── types/                # TypeScript 타입
│   │   ├── database.ts
│   │   ├── store.ts
│   │   ├── menu.ts
│   │   └── qrcode.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. 필수 패키지 목록

### 4.1 핵심 패키지
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.0"
  }
}
```

### 4.2 UI 및 스타일링
```json
{
  "dependencies": {
    "tailwindcss": "^3.3.0",
    "@tailwindcss/typography": "^0.5.10",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

### 4.3 UI 컴포넌트
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-toast": "^1.1.5",
    "lucide-react": "^0.294.0"
  }
}
```

### 4.4 폼 및 유효성 검사
```json
{
  "dependencies": {
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0"
  }
}
```

### 4.5 상태 관리
```json
{
  "dependencies": {
    "zustand": "^4.4.0"
  }
}
```

### 4.6 인증
```json
{
  "dependencies": {
    "next-auth": "^4.24.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0"
  }
}
```

### 4.7 QR 코드
```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "@types/qrcode": "^1.5.5"
  }
}
```

### 4.8 기타 유틸리티
```json
{
  "dependencies": {
    "date-fns": "^2.30.0",
    "react-dropzone": "^14.2.3"
  }
}
```

---

## 5. 환경 변수 설정

### .env.example
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. 개발 우선순위

### High Priority (MVP 필수)
1. ✅ 프로젝트 초기 설정
2. 인증 시스템 (Google OAuth)
3. 가게 CRUD
4. 메뉴 CRUD
5. QR 코드 생성
6. 고객용 메뉴 페이지

### Medium Priority (Phase 2)
1. 메뉴 검색
2. 통계 대시보드
3. 이미지 최적화
4. 성능 개선

### Low Priority (Phase 3)
1. 다국어 지원
2. 고급 통계
3. 주문 기능
4. 알림 시스템

---

## 7. 코딩 컨벤션

### 7.1 파일 네이밍
- 컴포넌트: PascalCase (StoreCard.tsx)
- 유틸리티: kebab-case (format-date.ts)
- 타입: PascalCase (Store.ts)

### 7.2 컴포넌트 구조
```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface StoreCardProps {
  store: Store
  onClick: () => void
}

// 3. Component
export function StoreCard({ store, onClick }: StoreCardProps) {
  // 3.1 Hooks
  const [isHovered, setIsHovered] = useState(false)
  
  // 3.2 Functions
  const handleClick = () => {
    onClick()
  }
  
  // 3.3 Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### 7.3 Git Commit 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 및 설정 변경
```

---

## 8. 일정 (예상)

| 주차 | 내용 | 상태 |
|------|------|------|
| 1주차 | Phase 1-2: 초기 설정 + 디자인 시스템 | ⏳ 진행 중 |
| 2주차 | Phase 3-4: 인증 + DB 설계 | 📅 예정 |
| 3주차 | Phase 5-6: 멀티 스토어 + 대시보드 | 📅 예정 |
| 4주차 | Phase 7: 메뉴 관리 | 📅 예정 |
| 5주차 | Phase 8-9: QR 코드 + 고객 페이지 | 📅 예정 |
| 6주차 | Phase 10-11: 테스트 + 배포 | 📅 예정 |

---

## 9. 다음 단계 (즉시 실행)

### Step 1: 프로젝트 초기화
```bash
npx create-next-app@latest tableqr --typescript --tailwind --app --src-dir
cd tableqr
```

### Step 2: 필수 패키지 설치
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install next-auth
npm install react-hook-form zod @hookform/resolvers
npm install zustand
npm install qrcode @types/qrcode
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
npm install date-fns
npm install react-dropzone
```

### Step 3: Shadcn/ui 초기화
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add badge
```

### Step 4: 폴더 구조 생성
```bash
mkdir -p src/components/{ui,layout,store,menu,qrcode}
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/store
mkdir -p src/types
mkdir -p public/{images,icons}
```

### Step 5: 기본 설정 파일 생성
- Tailwind 커스텀 색상
- TypeScript 설정
- 환경 변수 템플릿

---

## 10. 성공 기준

### Phase 1 완료 기준
- [x] Next.js 프로젝트 정상 실행
- [ ] Tailwind CSS 적용 확인
- [ ] 기본 폴더 구조 완성
- [ ] 환경 변수 설정 완료

### MVP 완료 기준
- [ ] Google 로그인 작동
- [ ] 가게 추가/수정/삭제 가능
- [ ] 메뉴 추가/수정/삭제 가능
- [ ] QR 코드 생성 및 다운로드 가능
- [ ] 고객용 메뉴 페이지 정상 작동
- [ ] 모바일 반응형 정상 작동

---

**작성자**: AI Assistant  
**최종 업데이트**: 2025-10-12  
**상태**: 🚀 실행 준비 완료

