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

  try {
    // 1. Delete QR codes (they usually have the most dependencies)
    // Note: If schema is ON DELETE CASCADE, this is automatic, but explicit delete is safer 
    // and allows us to handle related data if needed.
    const { error: qrError } = await adminClient
      .from('qr_codes')
      .delete()
      .eq('user_id', id)
    
    if (qrError) console.error('Error deleting QR codes:', qrError)

    // 2. Anonymize scan events (keep the data for analytics, but remove user link)
    await adminClient
      .from('scan_events')
      .update({ user_id: null })
      .eq('user_id', id)

    // 3. Delete from other potential tables (based on schema findings)
    await adminClient.from('competition_registrations').delete().eq('user_id', id)
    await adminClient.from('coupon_redemptions').delete().eq('user_id', id)
    await adminClient.from('abuse_reports').delete().eq('reported_by', id)

    // 4. Delete user profile from database
    const { error: deleteError } = await adminClient
      .from('users')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: `Database deletion failed: ${deleteError.message}` }, { status: 500 })
    }

    // 5. Delete auth user from Supabase Auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(id)
    if (authError && authError.status !== 404) {
      // If user not found in auth, it's already gone, so we don't treat 404 as a fatal error
      return NextResponse.json({ error: `Auth deletion failed: ${authError.message}` }, { status: 500 })
    }

    // 6. Audit log
    await writeAuditLog({
      adminUserId: admin.adminId,
      action: 'user.delete',
      targetType: 'user',
      targetId: id,
      ipAddress: admin.ipAddress,
      details: { email: admin.user.email }
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('User deletion error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
