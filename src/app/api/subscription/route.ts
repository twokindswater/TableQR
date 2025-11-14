import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

type SubscriptionStatus = 'none' | 'trialing' | 'active' | 'past_due'

const MOCK_STATUS = (process.env.MOCK_SUBSCRIPTION_STATUS as SubscriptionStatus | undefined) ?? 'none'
const MOCK_TRIAL_END =
  process.env.MOCK_TRIAL_END ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status: SubscriptionStatus = MOCK_STATUS
  const storeLimit = status === 'active' || status === 'trialing' ? null : 1

  return NextResponse.json({
    status,
    storeLimit,
    trialEndsAt: status === 'trialing' ? MOCK_TRIAL_END : null,
    source: 'mock',
  })
}

