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
  const { confirm } = await request.json()

  if (!confirm) {
    return NextResponse.json({ error: 'Double confirmation required' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // 1. Deactivate QR codes instead of hard delete (safer)
  await adminClient
    .from('qr_codes')
    .update({ is_active: false })
    .eq('user_id', id)

  // 2. Anonymize scan events
  await adminClient
    .from('scan_events')
    .update({ user_id: null })
    .eq('user_id', id)

  // 3. Delete user profile
  const { error: deleteError } = await adminClient
    .from('users')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // 4. Delete auth user
  await adminClient.auth.admin.deleteUser(id)

  // 5. Audit log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'user.delete',
    targetType: 'user',
    targetId: id,
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
