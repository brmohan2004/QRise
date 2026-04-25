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
  const adminClient = createAdminClient()

  // Set to failed
  const { error } = await adminClient
    .from('bulk_jobs')
    .update({ 
      status: 'failed', 
      error_log: { message: 'Cancelled by administrator', cancelled_at: new Date().toISOString() },
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'bulk_job.cancel',
    targetType: 'bulk_job',
    targetId: id,
    details: { status: 'failed' },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
