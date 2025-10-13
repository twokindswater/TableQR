# TableQR

QR 코드 기반 스마트 메뉴 관리 서비스

<div align="center">
  
  ![Status](https://img.shields.io/badge/Status-Phase%201%20Complete-success)
  ![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
  ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
  
</div>

---

## 📖 프로젝트 개요

TableQR은 식당 및 카페를 위한 디지털 메뉴 솔루션입니다. Gmail 계정 하나로 여러 매장을 관리하고, QR 코드를 통해 고객에게 실시간 메뉴 정보를 제공합니다.

## ✨ 주요 기능

### 🔐 간편한 인증
- Gmail 계정으로 로그인 (Google OAuth)
- 별도 회원가입 절차 불필요

### 🏪 멀티 스토어 관리
- 하나의 계정으로 여러 매장 관리
- 매장별 독립적인 메뉴 및 QR 코드 관리
- 매장 정보 설정 (로고, 영업시간, 연락처, 주의사항)

### 📋 메뉴 관리
- 메뉴 등록, 수정, 삭제 (CRUD)
- 이미지 업로드 및 실시간 미리보기
- 카테고리별 메뉴 분류
- 품절 상태 관리

### 📱 QR 코드 생성
- 테이블별 고유 QR 코드 생성
- PNG/SVG 포맷 다운로드
- 인쇄용 템플릿 제공
- QR 스캔 시 고객용 메뉴 페이지로 즉시 연결

### 👥 고객용 메뉴 페이지
- 모바일 최적화 반응형 디자인
- 카테고리별 메뉴 탐색
- 매장 정보 및 주의사항 표시
- 로그인 불필요

---

## 🚀 빠른 시작

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/TableQR.git
cd TableQR

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

자세한 설치 가이드는 [SETUP.md](./SETUP.md)를 참고하세요.

---

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js, Google OAuth 2.0
- **Storage**: Supabase Storage
- **QR Code**: qrcode.js

---

## 📂 프로젝트 구조

```
TableQR/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # 인증 페이지
│   │   ├── (dashboard)/    # 대시보드 (예정)
│   │   └── menu/           # 고객용 메뉴 (예정)
│   ├── components/         # React 컴포넌트
│   │   └── ui/            # 공통 UI 컴포넌트
│   ├── lib/               # 유틸리티 함수
│   ├── types/             # TypeScript 타입
│   └── hooks/             # Custom Hooks (예정)
├── public/                # 정적 파일
├── docs/                  # 문서 (PRD, 디자인 명세 등)
└── ...config files
```

---

## 📚 문서

- [📄 PRD (제품 요구사항 문서)](./PRD.md)
- [🎨 UI/UX 디자인 명세서](./UI_Design_Specification.md)
- [📋 개발 계획](./Development_Plan.md)
- [⚙️ 설치 가이드](./SETUP.md)
- [📊 개발 진행 상황](./PROGRESS.md)

---

## 📈 개발 진행 상황

| Phase | 상태 | 설명 |
|-------|------|------|
| **Phase 1** | ✅ **완료** | 프로젝트 초기 설정 |
| Phase 2 | 📅 예정 | 디자인 시스템 구축 |
| Phase 3 | 📅 예정 | 인증 시스템 (Google OAuth) |
| Phase 4 | 📅 예정 | 데이터베이스 설계 및 구축 |
| Phase 5 | 📅 예정 | 멀티 스토어 관리 기능 |
| Phase 6-11 | 📅 예정 | 메뉴 관리, QR 코드, 고객 페이지 등 |

**전체 진행률**: 20% (Phase 1 완료)

자세한 진행 상황은 [PROGRESS.md](./PROGRESS.md)를 참고하세요.

---

## 🎯 MVP 기능 (개발 예정)

### Phase 1 ✅ (완료)
- [x] Next.js 프로젝트 설정
- [x] Tailwind CSS 설정
- [x] 기본 UI 컴포넌트
- [x] 로그인 페이지 UI

### Phase 2-5 (진행 예정)
- [ ] Google OAuth 로그인
- [ ] 가게 추가/수정/삭제
- [ ] 메뉴 CRUD
- [ ] QR 코드 생성
- [ ] 고객용 메뉴 페이지

---

## 🤝 기여하기

이 프로젝트는 현재 개발 중입니다. 기여를 원하시면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

추후 결정

---

## 📞 문의

프로젝트 관련 문의사항은 Issues를 통해 남겨주세요.

---

## 🌟 스크린샷 (예정)

개발 완료 후 추가 예정

---

**개발 상태**: Phase 1 완료 (2025-10-12)  
**다음 단계**: Phase 2 - 디자인 시스템 구축

---

<div align="center">
  <sub>Built with ❤️ using Next.js and Tailwind CSS</sub>
</div>
