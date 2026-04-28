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

  // 1. Delete all QR codes in this batch
  const { error: qrError } = await adminClient
    .from('qr_codes')
    .delete()
    .eq('bulk_job_id', id)

  if (qrError) {
    return NextResponse.json({ error: qrError.message }, { status: 500 })
  }

  // 2. Delete the bulk job record itself
  const { error: jobError } = await adminClient
    .from('bulk_jobs')
    .delete()
    .eq('id', id)

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 })
  }

  // 3. Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'bulk_job.delete',
    targetType: 'bulk_job',
    targetId: id,
    details: { deleted: true },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
