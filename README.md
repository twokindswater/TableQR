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

## 💳 Billing & Subscription (Polar + Supabase)

TableQR는 Polar Checkout을 사용해 단일 구독 상품(7일 무료 체험 → 월 $5)으로 운영됩니다. Google OAuth만 지원하므로 `google:<sub>` 형식의 외부 키로 모든 결제 데이터를 매핑합니다.

1. **DB 마이그레이션**  
   `supabase/migrations/005_billing_schema.sql`을 적용하면 아래 최소 스냅샷 테이블이 생성됩니다.
   - `billing_customers(user_ref, polar_customer_id, region)`
   - `subscriptions(user_ref, status, trial_end, current_period_end, product_id, plan_name, updated_at, source)`
   - `billing_events(event_id, event_type, payload)`

2. **환경 변수**  
   ```
   POLAR_ACCESS_TOKEN=...   # checkouts:write, subscriptions:read, customers:read 권한 권장
   POLAR_ENVIRONMENT=sandbox|production
   NEXT_PUBLIC_POLAR_PRODUCT_ID=...
   POLAR_WEBHOOK_SECRET=...
   NEXT_PUBLIC_APP_URL=https://tableqr.yourdomain.com
   SUPABASE_SERVICE_ROLE_KEY=...   # webhook → DB upsert & 서버 측 조회에 필수
   ```

3. **Checkout 메타데이터**  
   `/api/checkout`가 자동으로 `customerExternalId="google:<sub>"`와 `metadata.userRef`를 Polar에 전달합니다. 이메일/이름은 Polar에만 남고 Supabase에는 저장하지 않습니다.

4. **Webhook 구성**  
   Polar 대시보드에서 `POST https://{app-domain}/api/billing/webhook`으로 구독 이벤트를 전송하고, 동일한 `POLAR_WEBHOOK_SECRET`을 사용하세요. 웹훅은 멱등 처리되며 `billing_events`에 기록된 뒤 `subscriptions` 스냅샷을 갱신합니다.

5. **구독 관리 (Customer Portal)**  
   - `/api/billing/portal`이 Polar Customer Portal 세션을 생성해 고객이 카드 변경·취소·재구독을 직접 처리합니다.  
   - 대시보드 배너와 CTA는 해당 엔드포인트로 리다이렉트하여 취소/결제 관리 UX를 제공합니다.

6. **앱 가드 흐름**  
   - `/api/subscription`이 Supabase에서 스냅샷을 읽어 랜딩 CTA/대시보드 제약을 결정합니다.
   - Trial/Active 상태만 다점포·고급 기능이 열리고, 그 외 상태는 1개 매장 제한 + 업셀 모달이 노출됩니다.

모든 구독 데이터는 user_ref·상태·기간처럼 최소한의 정보만 저장하므로 GDPR/데이터 이전 요구사항을 충족하며, 이메일 등 PII는 Polar에 남겨둔 채 필요 시 API로 조회합니다.

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
