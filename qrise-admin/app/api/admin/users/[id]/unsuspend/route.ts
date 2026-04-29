import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend'
import { writeAuditLog } from '@/lib/audit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request)
    if ('error' in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status })
    }

    const { id } = await params
    const adminClient = createAdminClient()

    const { data: user, error: updateError } = await adminClient
      .from('users')
      .update({
        is_suspended: false,
        suspension_reason: null,
        suspended_reason: null,
        suspended_at: null
      })
      .eq('id', id)
      .select('email, full_name')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await writeAuditLog({
      adminUserId: admin.adminId,
      action: 'user.unsuspend',
      targetType: 'user',
      targetId: id,
      ipAddress: admin.ipAddress
    })

    if (user?.email) {
      await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: user.email,
        subject: 'Your QRise account has been reinstated',
        text: `Hello ${user.full_name || 'there'},\n\nYour account suspension has been lifted. You can now log in to QRise normally.\n\nThank you for your patience.`
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
