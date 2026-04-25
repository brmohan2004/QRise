import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('coupons')
    .select('*, redemptions:coupon_redemptions(count)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Flatten redemptions count
  const coupons = data.map(coupon => ({
    ...coupon,
    uses_count: coupon.redemptions?.[0]?.count || 0
  }))

  return NextResponse.json(coupons)
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const body = await request.json()
  const adminClient = createAdminClient()

  // Ensure code is uppercased
  const couponData = {
    ...body,
    code: body.code.toUpperCase(),
    created_by: admin.adminId
  }

  const { data, error } = await adminClient
    .from('coupons')
    .insert([couponData])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit Log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'coupon.create',
    targetType: 'coupon',
    targetId: data.id,
    details: couponData,
    ipAddress: admin.ipAddress
  })

  return NextResponse.json(data)
}
