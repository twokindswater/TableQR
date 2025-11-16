import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

interface RouteParams {
  params: {
    storeId: string
  }
}

function parseStoreId(storeId: string) {
  const id = Number(storeId)
  return Number.isFinite(id) ? id : null
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 })
  }

  const storeId = parseStoreId(params.storeId)
  if (storeId === null) {
    return NextResponse.json({ error: "Invalid store id" }, { status: 400 })
  }

  const { data: store, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("store_id", storeId)
    .eq("user_id", session.user.id)
    .single()

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500
    if (status === 500) {
      console.error("[api/stores/:id] failed to load store:", error)
    }
    return NextResponse.json({ error: "Store not found" }, { status })
  }

  const { data: categories, error: categoryError } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("store_id", storeId)
    .order("display_order", { ascending: true })

  if (categoryError) {
    console.error("[api/stores/:id] failed to load categories:", categoryError)
    return NextResponse.json({ error: "Failed to load store categories" }, { status: 500 })
  }

  const { data: menus, error: menuError } = await supabaseAdmin
    .from("menus")
    .select("*")
    .eq("store_id", storeId)
    .order("display_order", { ascending: true })

  if (menuError) {
    console.error("[api/stores/:id] failed to load menus:", menuError)
    return NextResponse.json({ error: "Failed to load store menus" }, { status: 500 })
  }

  return NextResponse.json({
    store,
    categories: categories ?? [],
    menus: menus ?? [],
  })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 })
  }

  const storeId = parseStoreId(params.storeId)
  if (storeId === null) {
    return NextResponse.json({ error: "Invalid store id" }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from("stores")
    .delete()
    .eq("store_id", storeId)
    .eq("user_id", session.user.id)

  if (error) {
    console.error("[api/stores/:id] failed to delete store:", error)
    return NextResponse.json({ error: "Failed to delete store" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 })
  }

  const storeId = parseStoreId(params.storeId)
  if (storeId === null) {
    return NextResponse.json({ error: "Invalid store id" }, { status: 400 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const fieldNames = [
    "name",
    "description",
    "phone",
    "business_hours",
    "notice",
    "address",
    "logo_url",
    "cover_url",
  ] as const
  const updateData: Record<string, string | null> = {}
  for (const field of fieldNames) {
    if (!(field in payload)) continue
    const value = payload[field]
    updateData[field] = typeof value === "string" ? value : null
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("stores")
    .update(updateData)
    .eq("store_id", storeId)
    .eq("user_id", session.user.id)
    .select("*")
    .single()

  if (error) {
    console.error("[api/stores/:id] failed to update store:", error)
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 })
  }

  return NextResponse.json(data)
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
