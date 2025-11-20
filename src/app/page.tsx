import { redirect } from "@/navigation"
import { defaultLocale } from "@/i18n/config"

export default function RootRedirect() {
  redirect({ href: "/", locale: defaultLocale })
}
