import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend'
import { writeAuditLog } from '@/lib/audit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  let reason = 'Suspended by administrator'
  
  try {
    const body = await request.json()
    if (body.reason) reason = body.reason
  } catch (e) {
    // No body or invalid JSON, use default reason
  }

  const adminClient = createAdminClient()

  // 1. Update user record
  const { data: user, error: updateError } = await adminClient
    .from('users')
    .update({
      is_suspended: true,
      suspension_reason: reason,
      suspended_reason: reason,
      suspended_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('email, full_name')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // 2. Invalidate sessions
  await adminClient.auth.admin.signOut(id)

  // 3. Write audit log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'user.suspend',
    targetType: 'user',
    targetId: id,
    details: { reason },
    ipAddress: admin.ipAddress
  })

  // 4. Send email
  if (user?.email) {
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: user.email,
      subject: 'Your QRise account has been suspended',
      text: `Hello ${user.full_name || 'there'},\n\nYour account has been suspended for the following reason: ${reason}\n\nIf you believe this is a mistake, please contact support.`
    })
  }

  return NextResponse.json({ success: true })
}
