'use client'

import { useTransition, useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/navigation"
import { useSearchParams } from "@/navigation-client"
import { locales, localeNames } from "@/i18n/config"
import { cn } from "@/lib/utils"

type LocaleOption = (typeof locales)[number]

interface LocaleSwitcherProps {
  className?: string
  size?: "sm" | "md"
  hideLabel?: boolean
}

export function LocaleSwitcher({ className, size = "md", hideLabel = false }: LocaleSwitcherProps) {
  const locale = useLocale() as LocaleOption
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("common")
  const [isPending, startTransition] = useTransition()

  const normalizedPathname = useMemo(() => {
    if (!pathname) return "/"
    const localePattern = new RegExp(`^/(?:${locales.join("|")})(?=/|$)`, "i")
    const stripped = pathname.replace(localePattern, "")
    return stripped === "" ? "/" : stripped
  }, [pathname])

  const handleChange = (nextLocale: LocaleOption) => {
    if (nextLocale === locale) return
    startTransition(() => {
      const query = searchParams?.toString()
      const basePath = normalizedPathname || "/"
      const target = query ? `${basePath}?${query}` : basePath
      router.replace(target, { locale: nextLocale })
    })
  }

  const sizeClasses =
    size === "sm"
      ? "h-9 px-3 text-sm"
      : "h-11 px-4 text-base"

  return (
    <label className={cn("flex flex-col gap-1 text-sm font-medium text-gray-600", className)}>
      {hideLabel ? (
        <span className="sr-only">{t("language.label")}</span>
      ) : (
        <span>{t("language.label")}</span>
      )}

      <div
        className={cn(
          "relative min-w-[130px] overflow-hidden rounded-lg border border-gray-300 bg-white transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40",
        )}
      >
        <select
          className={cn(
            "w-full appearance-none bg-transparent pl-4 pr-16 text-left text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            sizeClasses,
          )}
          value={locale}
          aria-label={t("language.label")}
          onChange={(event) => handleChange(event.target.value as LocaleOption)}
          disabled={isPending}
        >
          {locales.map((option) => (
            <option key={option} value={option}>
              {localeNames[option]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center border-l border-gray-200 bg-white text-gray-500">
          ▾
        </span>
      </div>
    </label>
  )
}
