import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { getLocale } from "next-intl/server"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TableQR - 스마트 메뉴 관리",
  description: "QR 코드로 시작하는 스마트 메뉴 관리 서비스",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
