# TableQR Growth & UX Strategy

## 1. Proposition & Trial Strategy
- **Single Standard Plan**: 모두 동일한 `TableQR Standard` 상품, 7일 무료 체험 후 월 $5 자동 전환(Polar).
- **Value-first Messaging**: 헤더/히어로 CTA는 “7일 무료 체험 시작”으로 통일. 무료 언급은 베네핏 보조로만 사용.
- **Pre-Trial Sandbox**: 로그인만 하면 1개 매장, 제한된 메뉴/푸시 기능 체험 가능. 다점포·고급 기능은 Trial 시작 시 해금.
- **Trial Activation Moments**: 다점포 추가, QR 출력 공유, 푸시 알림 설정 같은 고가치 액션에서 모달로 Trial/결제 CTA 유도.
- **Post-Trial UX**: Trial 중엔 D-day 배너, 만료 시 읽기 전용 전환 + 즉시 Checkout 버튼 노출.

## 2. Redirect & Auth Flow
1. **Public Routes**: `/`, `/login`, `/privacy`, `/terms`, `/#*`, `/store/:id`(고객용 메뉴) – 로그인 없이 접근.
2. **Protected Routes**: `/stores/**`, 상태 변경 API, 결제 API.
3. **Middleware 동작**:
   - 보호 라우트 접근 시 세션 쿠키 없으면 `/login?callbackUrl=<원경로>`로 리다이렉트.
   - 세션 존재 시 계속 진행.
4. **Landing Behavior**:
   - 로그인 상태 사용자가 `/` 접근: Trial/Active면 자동으로 `/stores`로 리다이렉트, 헤더 CTA 역시 “대시보드로 이동”.
   - 미로그인: 헤더 주요 CTA는 “로그인”, 히어로 CTA는 `/#pricing`으로 안내하여 정보 탐색 → 결제 순서를 유지.
   - 미로그인 CTA는 항상 `/login?callbackUrl=/stores` 혹은 `/api/checkout?products=...`.
5. **Checkout Flow**:
   - `PricingSection`과 대시보드 업셀 모달은 동일한 Checkout URL(`/api/checkout?products=<POLAR_PRODUCT_ID>`).
   - Checkout 성공 → `/stores`, 취소/실패 → 랜딩 `/#pricing`.
6. **Billing Portal**:
   - `/api/billing/portal`에서 Polar Customer Portal 세션을 생성해 사용자가 카드 변경/취소/재구독을 직접 처리하도록 한다.
   - 대시보드 배너의 보조 CTA는 항상 Portal로 연결되어, 체험/유료 사용자 모두가 스스로 결제 상태를 관리할 수 있다.

## 3. Dashboard Flow Rules
| 상태 | 허용 액션 | 제한/유도 |
| --- | --- | --- |
| Sandbox(Trial 미시작) | 첫 매장 생성/편집 | 두 번째 매장 추가 시 Trial 모달 → Checkout |
| Trial 진행 중 | 모든 기능 | Trial 종료 D-3 배너로 결제 상기 |
| Trial 만료/구독 해지 | 읽기 전용, 데이터 조회 | 모든 쓰기 버튼에서 재결제 모달 유도 |
| Active 구독 | 무제한 사용 | 없음 |

## 4. Metrics & Signals
| 지표 | 설명 | 수집 위치 |
| --- | --- | --- |
| `hero_cta_click` | 랜딩 Hero CTA 클릭 수 | `/` CTA onClick |
| `pricing_cta_click` | Pricing 버튼 클릭 → Checkout 진입 수 | `PricingSection` |
| `login_success` | Google 로그인 완료 | NextAuth callback |
| `trial_started` | Polar Checkout 성공(Trial 시작) | Polar 웹훅 + DB |
| `stores_created` | 사용자별 매장 생성 수 | Supabase trigger |
| `multi_store_block` | 다점포 제한 모달 노출 수 | `/stores` 업셀 모달 |
| `trial_to_paid_rate` | Trial → Paid 전환율 | subscription 테이블 |
| `churn_warning` | Trial 종료 3일 전 배너 노출 수 | Dashboard banner |

> 추가적으로 `QR_share_click`, `push_setup_complete`, `menu_update_count` 등을 파생 지표로 추적하면 Trial 가치 인지를 확인할 수 있습니다.
