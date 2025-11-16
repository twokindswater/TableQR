import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[api/stores] failed to load stores:", error)
    return NextResponse.json({ error: "Failed to load stores" }, { status: 500 })
  }

  return NextResponse.json({ stores: data ?? [] })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const insertData = {
    name: typeof payload.name === "string" ? payload.name : null,
    description: typeof payload.description === "string" ? payload.description : null,
    phone: typeof payload.phone === "string" ? payload.phone : null,
    business_hours: typeof payload.business_hours === "string" ? payload.business_hours : null,
    notice: typeof payload.notice === "string" ? payload.notice : null,
    address: typeof payload.address === "string" ? payload.address : null,
    logo_url: typeof payload.logo_url === "string" ? payload.logo_url : null,
    cover_url: typeof payload.cover_url === "string" ? payload.cover_url : null,
    user_id: session.user.id,
  }

  if (!insertData.name) {
    return NextResponse.json({ error: "Store name is required" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("stores")
    .insert(insertData)
    .select("*")
    .single()

  if (error) {
    console.error("[api/stores] failed to create store:", error)
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
