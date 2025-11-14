'use client'

import { useTransition } from "react"
import { signOut } from "next-auth/react"

import { cn } from "@/lib/utils"

interface LandingLogoutButtonProps {
  className?: string
}

export function LandingLogoutButton({ className }: LandingLogoutButtonProps) {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(() => {
      signOut({ callbackUrl: "/" })
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
      {pending ? "로그아웃 중..." : "로그아웃"}
    </button>
  )
}

