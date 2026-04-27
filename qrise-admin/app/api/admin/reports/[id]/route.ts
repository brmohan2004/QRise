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
  const { status, action_taken } = await request.json()

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('abuse_reports')
    .update({ 
      status, 
      action_taken, 
      reviewed_by: admin.adminId 
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'abuse_report.update',
    targetType: 'abuse_report',
    targetId: id,
    details: { status, action_taken },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
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
    .from('abuse_reports')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'abuse_report.delete',
    targetType: 'abuse_report',
    targetId: id,
    details: { deleted: true },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
