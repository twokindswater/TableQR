import { NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/providers/session-provider"
import { locales, type Locale } from "@/i18n/config"

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: Locale }
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params

  setRequestLocale(locale)
  const messages = (await import(`@/i18n/messages/${locale}.ts`)).default

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SessionProvider>
        {children}
        <Toaster />
      </SessionProvider>
    </NextIntlClientProvider>
  )
}
