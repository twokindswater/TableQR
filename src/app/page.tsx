import Link from "next/link"
import { Bell, Edit3, Globe, Laptop, QrCode } from "lucide-react"
import { getServerSession } from "next-auth"

import { PricingSection } from "@/components/landing/pricing-section"
import { authOptions } from "@/lib/auth"
import { CHECKOUT_PATH } from "@/lib/checkout"

const features = [
  {
    title: "QR 하나로 즉시 접속",
    description: "앱 설치나 로그인 없이 누구나 바로 메뉴 확인",
    icon: QrCode,
  },
  {
    title: "클릭 한 번으로 메뉴 수정",
    description: "메뉴나 가격이 바뀌면 즉시 반영",
    icon: Edit3,
  },
  {
    title: "언어가 달라도 걱정 끝",
    description: "브라우저 자동 번역으로 글로벌 손님에게도 쉽게",
    icon: Globe,
  },
  {
    title: "푸시 알림도 앱 없이",
    description: "대기번호 알림을 브라우저로 바로 전송",
    icon: Bell,
  },
  {
    title: "어디서나 관리하세요",
    description: "관리자 페이지에서 메뉴·대기 모두 제어 가능",
    icon: Laptop,
  },
]

const impactHighlights = [
  {
    value: "7일 무료",
    label: "TableQR Standard 체험",
    description: "다점포·푸시 알림까지 전부 열려요.",
  },
  {
    value: "1개의 QR",
    label: "모든 매장을 커버",
    description: "고객은 QR만 스캔하면 끝.",
  },
  {
    value: "5분 → 즉시",
    label: "메뉴 업데이트 시간",
    description: "변동 사항을 클릭 한 번으로 반영.",
  },
]

const faqs = [
  {
    question: "설치가 필요한가요?",
    answer:
      "TableQR은 100% 웹 기반이기 때문에 어떤 설치도 필요하지 않습니다. QR을 비치하기만 하면 됩니다.",
  },
  {
    question: "언어 지원은 되나요?",
    answer:
      "브라우저 자동 번역을 지원해 외국인 고객도 자신의 언어로 메뉴를 확인할 수 있습니다.",
  },
  {
    question: "스마트폰만으로 관리 가능한가요?",
    answer:
      "예, 관리자 페이지 역시 모바일 최적화가 되어 있어 스마트폰으로 메뉴와 대기를 제어할 수 있습니다.",
  },
]

export default async function Home() {
  const session = await getServerSession(authOptions)
  const isAuthenticated = Boolean(session)
  const dashboardUrl = "/stores"
  const checkoutTarget = CHECKOUT_PATH ?? dashboardUrl
  const trialCtaHref = isAuthenticated
    ? checkoutTarget
    : `/login?callbackUrl=${encodeURIComponent(checkoutTarget)}`
  const headerLoginHref = `/login?callbackUrl=${encodeURIComponent(dashboardUrl)}`
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-2xl font-semibold text-primary">TableQR</div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-primary">
              기능
            </a>
            <a href="#demo" className="hover:text-primary">
              데모
            </a>
            <a href="#pricing" className="hover:text-primary">
              Pricing
            </a>
            {!isAuthenticated && (
              <Link href={headerLoginHref} className="hover:text-primary">
                로그인
              </Link>
            )}
          </nav>
          <Link
            href={isAuthenticated ? dashboardUrl : trialCtaHref}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary-hover"
          >
            {isAuthenticated ? "대시보드로 이동" : "7일 무료 체험 시작"}
          </Link>
        </div>
      </header>

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-16 md:flex-row md:py-24">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <p className="inline-flex rounded-full bg-primary-light px-4 py-1 text-sm font-semibold text-primary">
              QR 메뉴 SaaS · TableQR Standard
            </p>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              한 번의 QR로 다점포 운영을 끝내세요.
            </h1>
            <p className="text-lg text-gray-600 md:text-xl">
              메뉴 수정, 대기 알림, 다국어 대응까지 모두 웹에서 즉시 반영됩니다.
              7일 동안 제한 없이 체험하고, 계속 쓰고 싶다면 월 $5면 충분해요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
              <Link
                href={trialCtaHref}
                className="rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover"
              >
                7일 무료 체험 시작
              </Link>
              {isAuthenticated ? (
                <Link
                  href={dashboardUrl}
                  className="rounded-full border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
                >
                  대시보드로 이동
                </Link>
              ) : (
                <a
                  href="#features"
                  className="rounded-full border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
                >
                  기능 살펴보기
                </a>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="relative mx-auto max-w-md rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-2xl">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <div className="mb-6 flex items-center justify-between text-sm uppercase tracking-wide text-white/70">
                  <span>TableQR Live Menu</span>
                  <span>24/7 Sync</span>
                </div>
                <div className="rounded-2xl bg-white p-5 text-gray-900 shadow-lg">
                  <div className="mb-4 text-sm font-semibold text-gray-500">
                    스마트 테이블 #12
                  </div>
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          트러플 파스타
                        </p>
                        <p className="text-xs text-gray-500">
                          5분 전 업데이트
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ₩18,000
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          라임 에이드
                        </p>
                        <p className="text-xs text-gray-500">
                          재고 넉넉
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ₩6,000
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-center">
                    <p className="text-xs font-semibold text-gray-500">
                      QR SCAN READY
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      손님이 QR을 스캔하면 바로 이 화면을 확인합니다.
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 bottom-6 hidden w-40 rounded-2xl bg-white/90 p-4 text-sm text-gray-900 shadow-xl md:block">
                <p className="text-xs font-semibold text-primary">
                  실시간 대기 안내
                </p>
                <p className="text-sm font-medium">홍길동님, 입장 준비되었어요!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Features
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              매장 운영에 필요한 디지털 메뉴의 핵심
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              QR 한 번으로 메뉴를 보여주고, 관리자 페이지에서 즉시 업데이트할 수
              있는 기능을 모두 담았습니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-primary-light p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Why TableQR
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              7일 체험으로 확인할 수 있는 변화
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {impactHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-gray-100 bg-gray-50 p-6 text-gray-800 shadow-sm"
              >
                <p className="text-3xl font-extrabold text-primary">{item.value}</p>
                <p className="mt-2 text-lg font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Demo
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              미리보기
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Mobile Menu
              </p>
              <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-gray-100 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            시그니처 메뉴 {item}
                          </p>
                          <p className="text-xs text-gray-500">
                            QR 스캔 즉시 노출
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          ₩{item * 7 + 11},000
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Admin Dashboard
              </p>
              <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-primary-light to-white p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        실시간 대기 인원
                      </p>
                      <p className="text-xs text-gray-500">
                        자동 푸시 알림 전송
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      12
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow">
                      <p className="text-xs font-semibold text-gray-500">
                        오늘 업데이트
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        8개 메뉴
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow">
                      <p className="text-xs font-semibold text-gray-500">
                        방문 국가
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        5개국
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              자주 묻는 질문
            </h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <p className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </p>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            Ready
          </p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            QR 하나면 당신의 메뉴가 전 세계로 연결됩니다.
          </h2>
          <p className="mt-4 text-lg text-white/90">
            TableQR로 스마트하고 글로벌한 메뉴 경험을 만들어보세요.
            고객은 QR을 스캔하고, 당신은 한 번의 클릭으로 메뉴를 업데이트하면
            됩니다.
          </p>
          <Link
            href={trialCtaHref}
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-base font-semibold text-primary shadow-lg transition hover:bg-gray-100"
          >
            7일 무료 체험 시작
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm md:flex-row md:items-center md:justify-between">
          <div className="text-lg font-semibold text-white">TableQR</div>
          <div className="flex flex-wrap gap-4">
            <a href="/terms" className="hover:text-white">
              Terms of Use
            </a>
            <a href="/privacy" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="/contact" className="hover:text-white">
              Contact
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" className="hover:text-white">
              Instagram
            </a>
            <a href="https://youtube.com" className="hover:text-white">
              YouTube
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} TableQR. All rights reserved.
        </div>
      </footer>
    </main>
  )
}
