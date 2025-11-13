import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Checkout } from "@polar-sh/nextjs"

import { authOptions } from "@/lib/auth"

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "")
const checkout = process.env.POLAR_ACCESS_TOKEN
  ? Checkout({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      successUrl: `${baseUrl}/stores`,
      returnUrl: `${baseUrl}/`,
      server: process.env.POLAR_ENVIRONMENT === "production" ? "production" : "sandbox",
    })
  : null

export async function GET(request: NextRequest) {
  if (!checkout) {
    return NextResponse.json({ error: "Polar checkout is not configured" }, { status: 500 })
  }

  const session = await getServerSession(authOptions)

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    )
    return NextResponse.redirect(loginUrl)
  }

  return checkout(request)
}

