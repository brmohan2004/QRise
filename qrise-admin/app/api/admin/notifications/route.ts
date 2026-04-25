import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const adminClient = createAdminClient()
  const { data, error, count } = await adminClient
    .from('notifications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, total: count })
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const body = await request.json()
  const { type, subject, body: content, targetType, targetId, targetPlan, segment, sendImmediately } = body
  
  const adminClient = createAdminClient()

  // 1. Resolve recipients
  let recipients: { email: string; id: string; full_name?: string }[] = []

  if (targetType === 'user' && targetId) {
    const { data: user } = await adminClient.from('users').select('id, email, full_name').or(`id.eq.${targetId},email.eq.${targetId}`).single()
    if (user) recipients = [user]
  } else if (targetType === 'plan' && targetPlan) {
    const { data: users } = await adminClient.from('users').select('id, email, full_name').eq('plan', targetPlan.toLowerCase())
    if (users) recipients = users
  } else if (targetType === 'all') {
    const { data: users } = await adminClient.from('users').select('id, email, full_name')
    if (users) recipients = users
  }

  const recipientEmails = recipients.map(r => r.email).filter(Boolean)

  // 2. Create notification record
  const { data: notification, error: createError } = await adminClient
    .from('notifications')
    .insert([{
      admin_id: admin.adminId,
      type,
      subject,
      body: content,
      target_type: targetType,
      target_id: targetType === 'user' ? recipients[0]?.id : null,
      target_plan: targetPlan,
      segment,
      recipient_count: recipientEmails.length,
      status: sendImmediately ? 'sending' : 'draft'
    }])
    .select()
    .single()

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  // 3. Send if requested
  if (sendImmediately && recipientEmails.length > 0) {
    // Process sending in background
    const processSending = async () => {
      try {
        if (type === 'email') {
          // Standard Email
          await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: recipientEmails,
            subject: subject || 'New Update from QRise',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
                <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">${subject}</h1>
                <div style="font-size: 16px; line-height: 1.6; color: #444;">
                  ${content}
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #999;">
                  You received this because you are a registered user of QRise. 
                  <a href="${process.env.MAIN_APP_URL}/settings" style="color: #000;">Manage preferences</a>
                </p>
              </div>
            `,
          })
        } else if (type === 'push') {
          // Push-Style Email (Minimal, centered, notification-like)
          await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: recipientEmails,
            subject: '🔔 ' + (subject || 'New Notification'),
            html: `
              <div style="background-color: #f9f9f9; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eee;">
                  <div style="padding: 20px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 10px;">
                    <img src="${process.env.MAIN_APP_URL}/favicon.ico" width="20" height="20" style="border-radius: 4px;" />
                    <span style="font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">QRise</span>
                  </div>
                  <div style="padding: 30px 25px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: #000;">${subject || 'Notification'}</h2>
                    <p style="margin: 0; font-size: 15px; color: #444; line-height: 1.4;">${content}</p>
                    <a href="${process.env.MAIN_APP_URL}/dashboard" style="display: inline-block; margin-top: 25px; background: #000; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 12px; font-weight: bold; font-size: 14px;">Open QRise</a>
                  </div>
                </div>
                <p style="text-align: center; font-size: 11px; color: #aaa; margin-top: 30px;">
                  This is a push-style notification. To disable these, visit your account settings.
                </p>
              </div>
            `,
          })
        }

        await adminClient
          .from('notifications')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', notification.id)
      } catch (err) {
        console.error('Notification send error:', err)
        await adminClient
          .from('notifications')
          .update({ status: 'failed' })
          .eq('id', notification.id)
      }
    }
    
    // We don't await this to return response quickly
    processSending()
  }

  // 4. Audit Log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'notification.sent',
    targetType: 'notification',
    targetId: notification.id,
    details: { type, targetType, recipientCount: recipientEmails.length },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json(notification)
}
