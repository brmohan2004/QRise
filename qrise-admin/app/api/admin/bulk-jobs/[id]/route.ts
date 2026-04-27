import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

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

  // 1. Mark all QR codes in this batch as deleted/suspended
  // Per requirement, we don't hard delete from the app, we suspend.
  // But in Admin, "Delete" might mean soft-delete.
  const { error: qrError } = await adminClient
    .from('qr_codes')
    .update({ 
      is_deleted: true, 
      status: 'deleted',
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('bulk_job_id', id)

  if (qrError) {
    return NextResponse.json({ error: qrError.message }, { status: 500 })
  }

  // 2. Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'bulk_job.delete_qrs',
    targetType: 'bulk_job',
    targetId: id,
    details: { deleted: true },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
