'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/login" })
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다.",
        variant: "default",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "로그아웃 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link href="/stores" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">QR</span>
          </div>
          <span className="font-bold text-lg">TableQR</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session?.user && (
              <>
                {session.user.image && session.user.image.trim() !== '' ? (
                  <div className="flex items-center space-x-2">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="text-sm font-medium hidden sm:inline">
                      {session.user.name}
                    </span>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">로그아웃</span>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

