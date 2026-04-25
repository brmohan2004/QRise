import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

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
  const { data: currentFlag } = await adminClient
    .from('feature_flags')
    .select('*')
    .eq('id', id)
    .single()

  const { data: updatedFlag, error } = await adminClient
    .from('feature_flags')
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
    action: 'feature_flag.update',
    targetType: 'feature_flag',
    targetId: id,
    details: { before: currentFlag, after: body },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json(updatedFlag)
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

  const { error } = await adminClient
    .from('feature_flags')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'feature_flag.delete',
    targetType: 'feature_flag',
    targetId: id,
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
