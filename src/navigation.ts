import { createNavigation } from "next-intl/navigation"

import { defaultLocale, locales } from "@/i18n/config"

export const localePrefix = "always"

export const { Link, redirect, useRouter, usePathname } = createNavigation({
  locales,
  defaultLocale,
  localePrefix,
})
