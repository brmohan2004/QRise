import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const adminClient = createAdminClient()

  const { data: coupon, error } = await adminClient
    .from('coupons')
    .select('*, redemptions:coupon_redemptions(*)')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(coupon)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const body = await request.json()

  // Basic validation if these are being updated
  if (body.discount_type === 'percent' && (body.discount_value <= 0 || body.discount_value > 100)) {
    return NextResponse.json({ error: 'Percentage discount must be between 0 and 100' }, { status: 400 })
  }
  if (body.discount_value !== undefined && body.discount_value <= 0) {
    return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Get current for audit
  const { data: current } = await adminClient.from('coupons').select('*').eq('id', id).single()

  const { data: updated, error } = await adminClient
    .from('coupons')
    .update({ 
      ...body, 
      code: body.code ? body.code.toUpperCase().trim() : undefined,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit Log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'coupon.update',
    targetType: 'coupon',
    targetId: id,
    details: { before: current, after: body },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const adminClient = createAdminClient()

  // Check if it has redemptions
  const { count } = await adminClient
    .from('coupon_redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('coupon_id', id)

  if (count && count > 0) {
    // If has redemptions, just deactivate instead of deleting to preserve history
    await adminClient.from('coupons').update({ is_active: false }).eq('id', id)
    return NextResponse.json({ message: 'Coupon has redemptions, deactivated instead of deleted' })
  }

  const { error } = await adminClient.from('coupons').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
