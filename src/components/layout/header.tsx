'use client'

import { Link, useRouter } from "@/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"

export function Header() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const locale = useLocale()
  const tCommon = useTranslations("common")

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: `/${locale}` })
      toast({
        title: tCommon("logout.successTitle"),
        description: tCommon("logout.successDescription"),
      })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: tCommon("logout.errorTitle"),
        description: tCommon("logout.errorDescription"),
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link href="/stores" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-white">QR</span>
          </div>
          <span className="text-lg font-bold">{tCommon("brand")}</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="md:hidden">
            <LocaleSwitcher size="sm" hideLabel />
          </div>
          <LocaleSwitcher size="sm" hideLabel className="hidden md:flex" />
          <nav className="flex items-center space-x-2">
            {session?.user && (
              <>
                {session.user.image && session.user.image.trim() !== "" ? (
                  <div className="flex items-center space-x-2">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="hidden text-sm font-medium sm:inline">{session.user.name}</span>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">{tCommon("actions.logout")}</span>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
