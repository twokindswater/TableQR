import createMiddleware from "next-intl/middleware"
import { defaultLocale, locales } from "./src/i18n/config"

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

export const config = {
  matcher: [
    "/",
    "/(ko|en)/:path*",
    "/((?!api|_next|_vercel|.*\\.).*)",
  ],
}
