import { supabaseAdmin } from "@/lib/supabase-admin"

export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"

export interface SubscriptionSnapshot {
  status: SubscriptionStatus
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  productId: string | null
  planName: string | null
  cancelAtPeriodEnd: boolean
}

const DEFAULT_SNAPSHOT: SubscriptionSnapshot = {
  status: "none",
  trialEndsAt: null,
  currentPeriodEnd: null,
  productId: null,
  planName: null,
  cancelAtPeriodEnd: false,
}

const KNOWN_STATUSES: SubscriptionStatus[] = [
  "none",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
]

const SUBSCRIPTION_STATUS_SET = new Set<SubscriptionStatus>(KNOWN_STATUSES)

export const SUBSCRIBED_STATUSES: SubscriptionStatus[] = ["active", "trialing"]

export function buildUserBillingRef(googleSub?: string | null) {
  if (!googleSub) return null
  return `google:${googleSub}`
}

export function normalizeStatus(status?: string | null): SubscriptionStatus {
  if (!status) return "none"
  if (SUBSCRIPTION_STATUS_SET.has(status as SubscriptionStatus)) {
    return status as SubscriptionStatus
  }
  return "none"
}

export async function getSubscriptionSnapshot(userRef: string | null): Promise<SubscriptionSnapshot> {
  if (!userRef || !supabaseAdmin) {
    return DEFAULT_SNAPSHOT
  }

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("status, trial_end, current_period_end, product_id, plan_name, cancel_at_period_end")
    .eq("user_ref", userRef)
    .maybeSingle()

  if (error) {
    console.error("[billing] Failed to load subscription snapshot:", error)
    return DEFAULT_SNAPSHOT
  }

  if (!data) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[billing] no subscription snapshot for', userRef)
    }
    return DEFAULT_SNAPSHOT
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[billing] raw snapshot:', data)
  }
  return {
    status: normalizeStatus(data.status),
    trialEndsAt: data.trial_end,
    currentPeriodEnd: data.current_period_end,
    productId: data.product_id,
    planName: data.plan_name,
    cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
  }
}

export async function getPolarCustomerId(userRef: string | null): Promise<string | null> {
  if (!userRef || !supabaseAdmin) {
    return null
  }

  const { data, error } = await supabaseAdmin
    .from("billing_customers")
    .select("polar_customer_id")
    .eq("user_ref", userRef)
    .maybeSingle()

  if (error) {
    console.error("Failed to load billing customer:", error)
    return null
  }

  return data?.polar_customer_id ?? null
}
