import { Link, redirect } from "@/navigation"
import type { LucideIcon } from "lucide-react"
import { Bell, Edit3, Globe, Laptop, QrCode } from "lucide-react"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"

import { PricingSection } from "@/components/landing/pricing-section"
import { LandingLogoutButton } from "@/components/landing/landing-logout-button"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { authOptions } from "@/lib/auth"
import { SUBSCRIBED_STATUSES, buildUserBillingRef, getSubscriptionSnapshot } from "@/lib/billing"
import type { Locale } from "@/i18n/config"

const featureKeys = ["instantAccess", "quickEdit", "multilingual", "pushNotifications", "remoteManagement"] as const
type FeatureKey = (typeof featureKeys)[number]

const featureIconMap: Record<FeatureKey, LucideIcon> = {
  instantAccess: QrCode,
  quickEdit: Edit3,
  multilingual: Globe,
  pushNotifications: Bell,
  remoteManagement: Laptop,
}

const highlightKeys = ["trial", "coverage", "updateSpeed"] as const
const faqKeys = ["install", "language", "mobile"] as const

const RENEWAL_STATUSES = new Set(["past_due", "unpaid", "incomplete", "incomplete_expired"])
const HERO_STATUS_STYLES: Record<"success" | "warning" | "danger", string> = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-900",
  warning: "border-amber-100 bg-amber-50 text-amber-900",
  danger: "border-rose-100 bg-rose-50 text-rose-900",
}
type HeroStatusTone = keyof typeof HERO_STATUS_STYLES

interface HeroStatusBlock {
  tone: HeroStatusTone
  title: string
  body?: string
}

interface HomePageProps {
  params: { locale: Locale }
}

export default async function Home({ params: { locale } }: HomePageProps) {
  const [tLanding, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "landing" }),
    getTranslations({ locale, namespace: "common" }),
  ])
  const session = await getServerSession(authOptions)
  const isAuthenticated = Boolean(session)
  const dashboardPath = "/stores"
  const loginPath = "/login"
  const localizedDashboardHref = `/${locale}${dashboardPath}`
  const headerLoginHref = {
    pathname: loginPath,
    query: { callbackUrl: localizedDashboardHref },
  } as const
  const userRef = buildUserBillingRef(session?.user?.id)
  const subscription = await getSubscriptionSnapshot(userRef)
  const isSubscribed = SUBSCRIBED_STATUSES.includes(subscription.status)
  const needsRenewal = RENEWAL_STATUSES.has(subscription.status)
  const isCanceled = subscription.status === "canceled"
  const trialEndDate = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null
  const trialDaysLeft =
    trialEndDate && !Number.isNaN(trialEndDate.getTime())
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null
  const trialEndText = trialEndDate
    ? new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }).format(trialEndDate)
    : null

  if (isAuthenticated && isSubscribed) {
    redirect({ href: dashboardPath, locale })
  }

  const heroPrimaryCta = { href: dashboardPath, label: tCommon("actions.goToDashboard") }
  const marketingHeroCta = {
    href: "#pricing",
    label: needsRenewal ? tLanding("hero.cta.renew") : tLanding("hero.cta.trial"),
  }
  const heroCta = isAuthenticated && isSubscribed ? heroPrimaryCta : marketingHeroCta
  const headerPrimaryCta =
    isAuthenticated && isSubscribed
      ? { ...heroPrimaryCta, locale }
      : { href: headerLoginHref, locale, label: tCommon("actions.login") }
  const secondaryCta = { href: "#features", label: tLanding("hero.cta.secondary") }
  const navLinks = [
    { href: "#features", label: tLanding("nav.features") },
    { href: "#demo", label: tLanding("nav.demo") },
    { href: "#pricing", label: tLanding("nav.pricing") },
  ]

  const heroStatus: HeroStatusBlock | null = (() => {
    if (subscription.status === "trialing") {
      return {
        tone: "warning",
        title:
          trialDaysLeft !== null
            ? tLanding("hero.status.trialing.countdown", { days: trialDaysLeft })
            : tLanding("hero.status.trialing.active"),
        body: trialEndText ? tLanding("hero.status.trialing.body", { date: trialEndText }) : undefined,
      }
    }
    if (subscription.status === "active") {
      return {
        tone: "success",
        title: tLanding("hero.status.active.title"),
        body: tLanding("hero.status.active.body"),
      }
    }
    if (needsRenewal) {
      return {
        tone: "danger",
        title: tLanding("hero.status.renewal.title"),
        body: tLanding("hero.status.renewal.body"),
      }
    }
    if (isCanceled) {
      return {
        tone: "warning",
        title: tLanding("hero.status.canceled.title"),
        body: tLanding("hero.status.canceled.body"),
      }
    }
    return null
  })()

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="text-2xl font-semibold text-primary">{tCommon("brand")}</div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-primary">
                {link.label}
              </a>
            ))}
            {isAuthenticated ? <LandingLogoutButton /> : null}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LocaleSwitcher hideLabel size="sm" />
            </div>
            <Link
              href={headerPrimaryCta.href}
              locale={headerPrimaryCta.locale}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary-hover"
            >
              {headerPrimaryCta.label}
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-16 md:flex-row md:py-24">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="sm:hidden">
              <LocaleSwitcher size="sm" />
            </div>
            <p className="inline-flex rounded-full bg-primary-light px-4 py-1 text-sm font-semibold text-primary">
              {tLanding("hero.badge")}
            </p>
            <h1 className="break-keep text-4xl font-bold leading-tight text-gray-900 md:max-w-2xl md:text-5xl">
              {tLanding("hero.title")}
            </h1>
            <p className="break-keep text-lg text-gray-600 md:max-w-2xl md:text-xl">{tLanding("hero.description")}</p>
            {heroStatus ? (
              <div className={`rounded-2xl border px-4 py-3 text-left text-sm ${HERO_STATUS_STYLES[heroStatus.tone]}`}>
                <p className="text-base font-semibold">{heroStatus.title}</p>
                {heroStatus.body && <p className="mt-1">{heroStatus.body}</p>}
              </div>
            ) : null}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
              <Link
                href={heroCta.href}
                className="rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover"
              >
                {heroCta.label}
              </Link>
              <a
                href={secondaryCta.href}
                className="rounded-full border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
              >
                {secondaryCta.label}
              </a>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative mx-auto max-w-md rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-2xl">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <div className="mb-6 flex items-center justify-between text-sm uppercase tracking-wide text-white/70">
                  <span>{tLanding("hero.card.menuLabel")}</span>
                  <span>{tLanding("hero.card.syncLabel")}</span>
                </div>
                <div className="rounded-2xl bg-white p-5 text-gray-900 shadow-lg">
                  <div className="mb-4 text-sm font-semibold text-gray-500">{tLanding("hero.card.tableName")}</div>
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tLanding("hero.card.dishes.truffle")}</p>
                        <p className="text-xs text-gray-500">{tLanding("hero.card.dishes.updated")}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">₩18,000</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tLanding("hero.card.dishes.limeAde")}</p>
                        <p className="text-xs text-gray-500">{tLanding("hero.card.dishes.inStock")}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">₩6,000</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-center">
                    <p className="text-xs font-semibold text-gray-500">{tLanding("hero.card.qrReadyLabel")}</p>
                    <p className="text-sm font-semibold text-gray-900">{tLanding("hero.card.qrReadyDescription")}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 bottom-6 hidden w-40 rounded-2xl bg-white/90 p-4 text-sm text-gray-900 shadow-xl md:block">
                <p className="text-xs font-semibold text-primary">{tLanding("hero.card.waitingTitle")}</p>
                <p className="text-sm font-medium">{tLanding("hero.card.waitingBody")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{tLanding("features.sectionLabel")}</p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{tLanding("features.title")}</h2>
            <p className="mt-4 text-lg text-gray-600">{tLanding("features.description")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((key) => {
              const Icon = featureIconMap[key]
              return (
                <div
                  key={key}
                  className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/50 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-primary-light p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{tLanding(`features.list.${key}.title`)}</h3>
                  <p className="mt-3 text-gray-600">{tLanding(`features.list.${key}.description`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{tLanding("highlights.sectionLabel")}</p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{tLanding("highlights.title")}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {highlightKeys.map((key) => (
              <div
                key={key}
                className="rounded-3xl border border-gray-100 bg-gray-50 p-6 text-gray-800 shadow-sm"
              >
                <p className="text-3xl font-extrabold text-primary">{tLanding(`highlights.${key}.value`)}</p>
                <p className="mt-2 text-lg font-semibold">{tLanding(`highlights.${key}.label`)}</p>
                <p className="mt-1 text-sm text-gray-600">{tLanding(`highlights.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{tLanding("demo.sectionLabel")}</p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{tLanding("demo.title")}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">{tLanding("demo.mobileHeading")}</p>
              <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {tLanding("demo.mobileMenuTitle", { index: item })}
                          </p>
                          <p className="text-xs text-gray-500">{tLanding("demo.mobileMenuSubtitle")}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">₩{item * 7 + 11},000</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">{tLanding("demo.dashboardHeading")}</p>
              <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-primary-light to-white p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tLanding("demo.queueTitle")}</p>
                      <p className="text-xs text-gray-500">{tLanding("demo.queueSubtitle")}</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">12</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow">
                      <p className="text-xs font-semibold text-gray-500">{tLanding("demo.todayTitle")}</p>
                      <p className="text-lg font-semibold text-gray-900">{tLanding("demo.todayValue")}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow">
                      <p className="text-xs font-semibold text-gray-500">{tLanding("demo.visitorsTitle")}</p>
                      <p className="text-lg font-semibold text-gray-900">{tLanding("demo.visitorsValue")}</p>
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
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{tLanding("faq.sectionLabel")}</p>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{tLanding("faq.title")}</h2>
          </div>
          <div className="space-y-6">
            {faqKeys.map((key) => (
              <div key={key} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-lg font-semibold text-gray-900">{tLanding(`faq.items.${key}.question`)}</p>
                <p className="mt-2 text-gray-600">{tLanding(`faq.items.${key}.answer`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">{tLanding("ready.sectionLabel")}</p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">{tLanding("ready.title")}</h2>
          <p className="mt-4 text-lg text-white/90">{tLanding("ready.description")}</p>
          <Link
            href={heroCta.href}
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-base font-semibold text-primary shadow-lg transition hover:bg-gray-100"
          >
            {heroCta.label}
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm md:flex-row md:items-center md:justify-between">
          <div className="text-lg font-semibold text-white">{tCommon("brand")}</div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/terms" className="hover:text-white">
              {tLanding("footer.terms")}
            </Link>
            <Link href="/privacy" className="hover:text-white">
              {tLanding("footer.privacy")}
            </Link>
            <Link href="/contact" className="hover:text-white">
              {tLanding("footer.contact")}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" className="hover:text-white">
              {tLanding("footer.instagram")}
            </a>
            <a href="https://youtube.com" className="hover:text-white">
              {tLanding("footer.youtube")}
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
          {tLanding("footer.rights", { year: new Date().getFullYear() })}
        </div>
      </footer>
    </main>
  )
}
