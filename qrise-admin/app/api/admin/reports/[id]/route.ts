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
  const { type, status, action_taken, resolution_notes } = await request.json()

  const adminClient = createAdminClient()

  if (type === 'abuse') {
    const { error } = await adminClient
      .from('abuse_reports')
      .update({ 
        status, 
        action_taken, 
        reviewed_by: admin.adminId 
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await adminClient
      .from('bug_reports')
      .update({ 
        status, 
        resolution_notes, 
        reviewed_by: admin.adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: `report.${type}.update`,
    targetType: type === 'abuse' ? 'abuse_report' : 'bug_report',
    targetId: id,
    details: { status, action_taken, resolution_notes },
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
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'abuse'

  const adminClient = createAdminClient()
  const table = type === 'abuse' ? 'abuse_reports' : 'bug_reports'

  const { error } = await adminClient
    .from(table)
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: `report.${type}.delete`,
    targetType: type === 'abuse' ? 'abuse_report' : 'bug_report',
    targetId: id,
    details: { deleted: true },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
