import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Checkout } from "@polar-sh/nextjs"

import { authOptions } from "@/lib/auth"
import { buildUserBillingRef } from "@/lib/billing"

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

  const userRef = buildUserBillingRef(session.user?.id)
  const enrichedUrl = new URL(request.url)

  if (userRef) {
    enrichedUrl.searchParams.set("customerExternalId", userRef)
    enrichedUrl.searchParams.set("metadata", JSON.stringify({ userRef }))
    if (session.user?.email) {
      enrichedUrl.searchParams.set("customerEmail", session.user.email)
    }
    if (session.user?.name) {
      enrichedUrl.searchParams.set("customerName", session.user.name)
    }
  }

  const proxiedRequest = new NextRequest(enrichedUrl.toString(), {
    headers: Object.fromEntries(request.headers.entries()),
  })

  return checkout(proxiedRequest)
}
