import { randomUUID } from "crypto"

import { NextRequest, NextResponse } from "next/server"
import { WebhookVerificationError, validateEvent } from "@polar-sh/sdk/webhooks"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { normalizeStatus } from "@/lib/billing"

type SubscriptionPayload = {
  type: string
  data: {
    status: string
    trialEnd: Date | null
    currentPeriodEnd: Date | null
    productId: string
    product?: { name?: string | null }
    customer: {
      id: string
      externalId: string | null
    }
  }
}

const SUBSCRIPTION_EVENT_TYPES = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.canceled",
  "subscription.uncanceled",
  "subscription.revoked",
])

function isSubscriptionPayload(payload: unknown): payload is SubscriptionPayload {
  return (
    typeof payload === "object" &&
    !!payload &&
    "type" in payload &&
    typeof (payload as SubscriptionPayload).type === "string" &&
    SUBSCRIPTION_EVENT_TYPES.has((payload as SubscriptionPayload).type) &&
    typeof (payload as SubscriptionPayload).data === "object" &&
    !!(payload as SubscriptionPayload).data
  )
}

function serializePayload(payload: unknown) {
  return JSON.parse(
    JSON.stringify(payload, (_, value) => {
      if (value instanceof Date) {
        return value.toISOString()
      }
      return value
    }),
  )
}

async function persistEvent(eventId: string, type: string, payload: unknown) {
  if (!supabaseAdmin) return

  await supabaseAdmin
    .from("billing_events")
    .upsert(
      {
        event_id: eventId,
        event_type: type,
        payload: serializePayload(payload),
      },
      { onConflict: "event_id" },
    )
}

async function upsertSubscription(payload: SubscriptionPayload) {
  if (!supabaseAdmin) return

  const userRef = payload.data.customer.externalId
  if (!userRef) {
    console.warn("Subscription payload missing customer externalId")
    return
  }

  await supabaseAdmin
    .from("billing_customers")
    .upsert(
      {
        user_ref: userRef,
        polar_customer_id: payload.data.customer.id,
      },
      { onConflict: "user_ref" },
    )

  const normalizedStatus = normalizeStatus(payload.data.status)
  const persistedStatus = normalizedStatus === "none" ? "incomplete" : normalizedStatus

  await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_ref: userRef,
        polar_customer_id: payload.data.customer.id,
        status: persistedStatus,
        trial_end: payload.data.trialEnd ? payload.data.trialEnd.toISOString() : null,
        current_period_end: payload.data.currentPeriodEnd ? payload.data.currentPeriodEnd.toISOString() : null,
        product_id: payload.data.productId,
        plan_name: payload.data.product?.name ?? null,
        updated_at: new Date().toISOString(),
        source: payload.type,
      },
      { onConflict: "user_ref" },
    )
}

export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production'
  if (!process.env.POLAR_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "POLAR_WEBHOOK_SECRET is not configured" }, { status: 500 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured" }, { status: 500 })
  }

  // Read raw body once
  const rawBody = await request.text()
  if (isDev) {
    console.log('[billing/webhook] received body length:', rawBody.length)
  }
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  }
  if (isDev) {
    console.log('[billing/webhook] headers:', {
      id: headers['webhook-id'],
      ts: headers['webhook-timestamp'],
      sig_present: Boolean(headers['webhook-signature']),
    })
  }

  let event
  try {
    // Allow skipping signature verification in non-production for manual tests
    if (process.env.POLAR_WEBHOOK_SKIP_VERIFY === 'true') {
      event = JSON.parse(rawBody)
      if (isDev) console.warn('[billing/webhook] SKIP VERIFY enabled, parsed event:', event?.type)
    } else {
      event = validateEvent(rawBody, headers, process.env.POLAR_WEBHOOK_SECRET)
    }
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }
    console.error("Failed to validate billing webhook:", error)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const eventId = headers["webhook-id"] || randomUUID()
  try {
    await persistEvent(eventId, event.type, event)
    if (isDev) console.log('[billing/webhook] persisted event:', eventId, event.type)
  } catch (e) {
    console.error('[billing/webhook] failed to persist event', e)
  }

  if (isSubscriptionPayload(event)) {
    if (isDev) console.log('[billing/webhook] upserting subscription for', event.data.customer?.externalId)
    try {
      await upsertSubscription(event)
      if (isDev) console.log('[billing/webhook] upserted subscription OK')
    } catch (e) {
      console.error('[billing/webhook] upsert error', e)
      return NextResponse.json({ error: 'Upsert failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
