import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Polar } from "@polar-sh/sdk"

import { authOptions } from "@/lib/auth"
import { buildUserBillingRef, getPolarCustomerId } from "@/lib/billing"

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "")
const portalReturnUrl = `${baseUrl}/stores`
const polarServer = process.env.POLAR_ENVIRONMENT === "production" ? "production" : "sandbox"
const polarClient = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: polarServer,
    })
  : null

export async function GET(request: NextRequest) {
  if (!polarClient) {
    return NextResponse.json({ error: "Polar client is not configured" }, { status: 500 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", "/stores")
    return NextResponse.redirect(loginUrl)
  }

  const userRef = buildUserBillingRef(session.user.id)
  const customerId = await getPolarCustomerId(userRef)

  if (!customerId) {
    return NextResponse.json(
      { error: "구독 정보가 확인되지 않습니다. 먼저 결제를 진행해주세요." },
      { status: 404 },
    )
  }

  try {
    const result = await polarClient.customerSessions.create({
      customerId,
      returnUrl: portalReturnUrl,
    })

    return NextResponse.redirect(result.customerPortalUrl)
  } catch (error: any) {
    console.error("Failed to create Polar customer portal session:", error)
    // Surface insufficient scope to help configuration
    const msg = typeof error?.body === 'string' ? error.body : undefined
    const scopeHint =
      'Polar access token needs customer_sessions:write (and possibly web:write) scope. Regenerate token and redeploy.'
    return NextResponse.json(
      { error: 'insufficient_scope', message: scopeHint, detail: msg },
      { status: 403 },
    )
  }
}
