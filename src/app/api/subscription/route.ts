import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { SUBSCRIBED_STATUSES, buildUserBillingRef, getSubscriptionSnapshot } from "@/lib/billing"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRef = buildUserBillingRef(session.user.id)
  if (process.env.NODE_ENV !== 'production') {
    console.log('[subscription] userRef:', userRef)
  }
  const snapshot = await getSubscriptionSnapshot(userRef)
  if (process.env.NODE_ENV !== 'production') {
    console.log('[subscription] snapshot:', snapshot)
  }
  const isMultiStore = SUBSCRIBED_STATUSES.includes(snapshot.status)

  return NextResponse.json({
    status: snapshot.status,
    trialEndsAt: snapshot.trialEndsAt,
    currentPeriodEnd: snapshot.currentPeriodEnd,
    planName: snapshot.planName,
    cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
    storeLimit: isMultiStore ? null : 1,
  })
}
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
