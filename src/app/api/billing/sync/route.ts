import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Polar } from "@polar-sh/sdk"

import { authOptions } from "@/lib/auth"
import { buildUserBillingRef, normalizeStatus } from "@/lib/billing"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.POLAR_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Polar not configured' }, { status: 500 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 })
  }

  const userRef = buildUserBillingRef(session.user.id)
  const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: process.env.POLAR_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  })

  try {
    const state = await polar.customers.getStateExternal({ externalId: userRef! })
    const sub = state.activeSubscriptions?.[0]

    // Always upsert billing customer link
    await supabaseAdmin
      .from('billing_customers')
      .upsert(
        { user_ref: userRef, polar_customer_id: state.id },
        { onConflict: 'user_ref' },
      )

    if (sub) {
      await supabaseAdmin
        .from('subscriptions')
        .upsert(
          {
            user_ref: userRef,
            polar_customer_id: state.id,
            status: normalizeStatus(sub.status),
            trial_end: sub.trialEnd ? sub.trialEnd.toISOString() : null,
            current_period_end: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
            product_id: sub.productId,
            plan_name: null,
            updated_at: new Date().toISOString(),
            source: 'sync',
          },
          { onConflict: 'user_ref' },
        )
    }

    return NextResponse.json({
      status: sub ? normalizeStatus(sub.status) : 'none',
      trialEndsAt: sub?.trialEnd?.toISOString() ?? null,
      currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
      productId: sub?.productId ?? null,
      polarCustomerId: state.id,
    })
  } catch (error) {
    console.error('[billing/sync] failed:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

