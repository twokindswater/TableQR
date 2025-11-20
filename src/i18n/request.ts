import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import { defaultLocale, locales, type Locale } from "./config"

function ensureLocale(locale?: string): Locale {
  if (!locale) {
    return defaultLocale
  }
  if (locales.includes(locale as Locale)) {
    return locale as Locale
  }
  return defaultLocale
}

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = ensureLocale(locale)

  try {
    return {
      locale: resolvedLocale,
      messages: (await import(`./messages/${resolvedLocale}.ts`)).default,
    }
  } catch (error) {
    console.error("Missing locale messages:", error)
    notFound()
  }
})
