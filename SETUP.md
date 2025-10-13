# TableQR - 설치 및 실행 가이드

## 📋 준비사항

- Node.js 18.17 이상
- npm 또는 yarn 패키지 관리자
- Git

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
# 또는
yarn install
```

### 2. 환경 변수 설정

**`.env` 파일**이 이미 생성되어 있습니다. 다음 값들을 실제 값으로 변경하세요:

```env
# NextAuth 설정 (필수)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# Google OAuth 자격 증명 (필수)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Supabase 설정 (Phase 4에서 설정 예정)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

> **⚠️ 중요**: 
> - `.env` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함)
> - **Google OAuth 자격 증명 발급**: `GOOGLE_OAUTH_SETUP.md` 참조
> - **환경 변수 상세 설명**: `ENV_SETUP.md` 참조
> - **NEXTAUTH_SECRET 생성**: `openssl rand -base64 32` 실행

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## 📁 프로젝트 구조

```
/TableQR
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 페이지
│   │   │   └── login/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/            
│   │   └── ui/                # 공통 UI 컴포넌트
│   ├── lib/                   # 유틸리티 함수
│   ├── types/                 # TypeScript 타입
│   └── hooks/                 # Custom Hooks (추후)
├── public/                    # 정적 파일
├── PRD.md                     # 제품 요구사항 문서
├── UI_Design_Specification.md # UI 디자인 명세
├── Development_Plan.md        # 개발 계획
└── package.json
```

---

## 🎨 현재 구현 상태

### ✅ 완료된 Phase
- [x] **Phase 1**: Next.js 14 프로젝트 설정 (App Router, TypeScript, Tailwind)
- [x] **Phase 2**: 디자인 시스템 및 공통 컴포넌트 (Button, Input, Card, Label, Textarea, Dialog, Toast, Badge, Select, Header, Spinner)
- [x] **Phase 3**: 인증 시스템 (Google OAuth, NextAuth.js, 세션 관리, 보호된 라우트)
- [x] **Phase 4**: 데이터베이스 설계 및 구축 (스키마, 마이그레이션, RLS, 헬퍼 함수)

### 📅 다음 단계
- [ ] **Phase 5**: 멀티 스토어 관리 기능 (스토어 목록, 추가/수정/삭제)

### ⚠️ 필수 설정 필요

#### 1. Google OAuth 설정 (Phase 3)
- `GOOGLE_OAUTH_SETUP.md` 파일 참조
- Google Cloud Console에서 OAuth 자격 증명 발급
- `.env` 파일에 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 입력

#### 2. Supabase 마이그레이션 적용 (Phase 4)
- Supabase Dashboard에서 프로젝트 활성화 (Resume Project)
- `PHASE4_COMPLETE.md` 참조하여 마이그레이션 적용
- 데이터베이스 테이블 생성 완료

---

## 🛠️ 사용 중인 기술 스택

### 핵심
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

### UI & Components
- **UI Library**: Radix UI
- **Icons**: Lucide React
- **Form**: React Hook Form + Zod (예정)

### Backend (예정)
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js + Google OAuth
- **Storage**: Supabase Storage
- **QR Code**: qrcode library

---

## 📝 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# Lint 검사
npm run lint
```

---

## 🎯 Phase별 개발 진행 상황

| Phase | 상태 | 설명 |
|-------|------|------|
| Phase 1 | ✅ 100% | 프로젝트 초기 설정 |
| Phase 2 | ✅ 100% | 디자인 시스템 구축 |
| Phase 3 | ✅ 100% | 인증 시스템 (Google OAuth) |
| Phase 4 | ✅ 100% | 데이터베이스 설계 및 구축 |
| Phase 5 | 📅 예정 | 멀티 스토어 관리 |

---

## 🐛 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

### Node modules 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### TypeScript 오류
```bash
# TypeScript 캐시 클리어
rm -rf .next
npm run dev
```

---

## 📚 추가 문서

- [PRD.md](./PRD.md) - 제품 요구사항 문서
- [UI_Design_Specification.md](./UI_Design_Specification.md) - UI 디자인 상세 명세
- [Development_Plan.md](./Development_Plan.md) - 개발 계획 및 로드맵
- [ENV_SETUP.md](./ENV_SETUP.md) - 환경 변수 설정 가이드
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - Google OAuth 설정 방법
- [PHASE3_COMPLETE.md](./PHASE3_COMPLETE.md) - Phase 3 완료 내역
- [PHASE4_DATABASE_SCHEMA.md](./PHASE4_DATABASE_SCHEMA.md) - 데이터베이스 스키마 설계
- [PHASE4_COMPLETE.md](./PHASE4_COMPLETE.md) - Phase 4 완료 내역

---

## 🎉 다음 할 일

Phase 4 완료 후:

1. **Supabase 마이그레이션 적용** (필수 ⚠️)
   - Supabase Dashboard에서 프로젝트 활성화
   - SQL 마이그레이션 실행 (3가지 방법 중 선택)
     - 옵션 A: Cursor에서 "Supabase 마이그레이션 적용해줘"
     - 옵션 B: Dashboard SQL Editor에서 직접 실행
     - 옵션 C: Supabase CLI 사용
   - `PHASE4_COMPLETE.md` 참조

2. **Phase 5 시작**: 멀티 스토어 관리 기능
   - 스토어 목록 페이지 (`/stores`)
   - 스토어 추가 페이지 (`/stores/new`)
   - 스토어 정보 입력/수정 폼
   - 스토어 대시보드 (`/stores/[id]`)

3. **이후 Phase**: 메뉴 관리, QR 코드, 고객 페이지
   - Phase 6: 메뉴 관리 기능
   - Phase 7: QR 코드 생성 및 관리
   - Phase 8: 고객용 메뉴 페이지

---

**문의사항이나 이슈가 있으시면 GitHub Issues를 통해 알려주세요!**

Happy Coding! 🚀

