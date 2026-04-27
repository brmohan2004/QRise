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
  const { is_active } = await request.json()
  const status = is_active ? 'active' : 'suspended'
  const adminClient = createAdminClient()

  // Update all QR codes in this batch
  const { error } = await adminClient
    .from('qr_codes')
    .update({ 
      is_active, 
      status,
      updated_at: new Date().toISOString() 
    })
    .eq('bulk_job_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also update the bulk job status if needed, 
  // but usually bulk_job status refers to the generation process (completed, processing, etc.)
  // We'll keep it as is for now.

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: `bulk_job.${is_active ? 'activate' : 'suspend'}`,
    targetType: 'bulk_job',
    targetId: id,
    details: { is_active, status },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
