'use client'

import { useMemo, useState, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/navigation"
import { useSearchParams } from "@/navigation-client"
import { locales, localeNames } from "@/i18n/config"
import { cn } from "@/lib/utils"
import { ChevronDown, Globe } from "lucide-react"

type LocaleOption = (typeof locales)[number]

interface LocaleSwitcherProps {
  className?: string
  size?: "sm" | "md"
  hideLabel?: boolean
  iconOnly?: boolean
}

export function LocaleSwitcher({
  className,
  size = "md",
  hideLabel = false,
  iconOnly = false,
}: LocaleSwitcherProps) {
  const locale = useLocale() as LocaleOption
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("common")
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const normalizedPathname = useMemo(() => {
    if (!pathname) return "/"
    const localePattern = new RegExp(`^/(?:${locales.join("|")})(?=/|$)`, "i")
    const stripped = pathname.replace(localePattern, "")
    return stripped === "" ? "/" : stripped
  }, [pathname])

  const handleChange = (nextLocale: LocaleOption) => {
    if (nextLocale === locale) return
    setIsOpen(false)
    startTransition(() => {
      const query = searchParams?.toString()
      const basePath = normalizedPathname || "/"
      const target = query ? `${basePath}?${query}` : basePath
      router.replace(target, { locale: nextLocale })
    })
  }

  const sizeClasses =
    size === "sm"
      ? iconOnly
        ? "h-9 w-9"
        : "h-9 px-3 text-sm"
      : iconOnly
        ? "h-11 w-11"
        : "h-11 px-4 text-base"

  return (
    <label className={cn("flex flex-col gap-1 text-sm font-medium text-gray-600", className)}>
      {hideLabel ? (
        <span className="sr-only">{t("language.label")}</span>
      ) : (
        <span>{t("language.label")}</span>
      )}

      <div className="relative">
        <button
          type="button"
          className={cn(
            iconOnly
              ? "inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
              : "flex w-full min-w-[130px] items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white text-gray-900 transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60",
            sizeClasses,
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={t("language.label")}
          onClick={() => setIsOpen((open) => !open)}
          disabled={isPending}
        >
          {iconOnly ? (
            <Globe className="h-4 w-4 text-gray-600" aria-hidden="true" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="text-sm font-medium">{localeNames[locale]}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
            </>
          )}
        </button>

        {isOpen ? (
          <ul
            role="listbox"
            aria-label={t("language.label")}
            className={cn(
              "absolute z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
              iconOnly ? "min-w-[130px]" : "w-full",
            )}
          >
            {locales.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option === locale}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-gray-50",
                    option === locale && "bg-gray-50 font-semibold text-primary",
                  )}
                  onClick={() => handleChange(option)}
                  disabled={isPending}
                >
                  <span>{localeNames[option]}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </label>
  )
}
