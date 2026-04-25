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

  const { data, error } = await adminClient
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
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
  const adminClient = createAdminClient()

  // Get current state for audit
  const { data: currentPlan } = await adminClient
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  const { data: updatedPlan, error } = await adminClient
    .from('plans')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'plan.update',
    targetType: 'plan',
    targetId: id,
    details: { before: currentPlan, after: body },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json(updatedPlan)
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

  // Check for users
  const { data: plan } = await adminClient.from('plans').select('name').eq('id', id).single()
  const { count } = await adminClient
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('plan', plan?.name?.toLowerCase())

  if (count && count > 0) {
    return NextResponse.json({ error: 'Cannot delete plan with active users' }, { status: 400 })
  }

  const { error } = await adminClient.from('plans').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
