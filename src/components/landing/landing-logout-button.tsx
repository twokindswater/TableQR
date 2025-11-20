'use client'

import { useTransition } from "react"
import { signOut } from "next-auth/react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

interface LandingLogoutButtonProps {
  className?: string
}

export function LandingLogoutButton({ className }: LandingLogoutButtonProps) {
  const [pending, startTransition] = useTransition()
  const locale = useLocale()
  const t = useTranslations("common.actions")

  const handleClick = () => {
    startTransition(() => {
      signOut({ callbackUrl: `/${locale}` })
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "text-left transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? t("loggingOut") : t("logout")}
    </button>
  )
}
