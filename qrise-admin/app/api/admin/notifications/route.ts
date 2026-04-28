import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend'
import { writeAuditLog } from '@/lib/audit'
import { getNotificationEmailTemplate } from '@/lib/email-templates'

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
  const { 
    type, 
    category = 'alert', 
    subject, 
    body: content, 
    targetType, 
    targetId, 
    targetPlan, 
    segment, 
    sendImmediately 
  } = body
  
  const adminClient = createAdminClient()

  // 1. Resolve recipients (Unified logic)
  let recipients: { email: string; id: string; full_name?: string }[] = []

  if (targetType === 'user' && targetId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)
    const { data: user, error: userFetchError } = await adminClient
      .from('users')
      .select('id, email, full_name')
      .or(isUuid ? `id.eq.${targetId},email.eq.${targetId}` : `email.eq.${targetId}`)
      .single()
    
    if (userFetchError || !user) {
      console.error('[API/admin/notifications] User not found:', targetId, userFetchError)
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 })
    }
    recipients = [user]
  } else if (targetType === 'plan' && targetPlan) {
    const { data: users } = await adminClient.from('users').select('id, email, full_name').eq('plan', targetPlan.toLowerCase())
    if (users) recipients = users || []
  } else if (targetType === 'segment' && segment) {
    let query = adminClient.from('users').select('id, email, full_name')
    if (segment.type === 'plan' && segment.plans?.length > 0) {
      query = query.in('plan', segment.plans)
    }
    if (segment.type === 'country' && segment.countries?.length > 0) {
      query = query.in('country', segment.countries)
    }
    const { data: users } = await query
    if (users) recipients = users
  } else if (targetType === 'all') {
    const { data: users } = await adminClient.from('users').select('id, email, full_name')
    if (users) recipients = users || []
  }

  const recipientEmails = recipients.map(r => r.email).filter(Boolean)

  console.log('[API/admin/notifications] Resolved recipients:', recipients.length)

  // 2. Create notification record
  const adminId = admin.adminId === 'admin_env_user' 
    ? '00000000-0000-0000-0000-000000000000' // Fallback UUID for environment admins
    : admin.adminId

  const { data: notification, error: createError } = await adminClient
    .from('notifications')
    .insert([{
      admin_id: adminId,
      type,
      category,
      subject,
      body: content,
      target_type: targetType,
      target_id: (targetType === 'user' && recipients[0]) ? recipients[0].id : null,
      target_plan: targetPlan,
      segment,
      recipient_count: recipients.length,
      status: sendImmediately ? 'sending' : 'draft'
    }])
    .select()
    .single()

  if (createError) {
    console.error('[API/admin/notifications] Supabase Insert Error:', createError)
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  // 3. In-App Persistence (The Bell) - We await this to ensure UI updates
  if (recipients.length > 0) {
    const userNotificationEntries = recipients.map(r => ({
      user_id: r.id,
      notification_id: notification.id,
    }))
    
    console.log(`[API/admin/notifications] Persisting ${userNotificationEntries.length} in-app notifications...`)
    
    const batchSize = 1000
    for (let i = 0; i < userNotificationEntries.length; i += batchSize) {
      const { error: insertError } = await adminClient
        .from('user_notifications')
        .insert(userNotificationEntries.slice(i, i + batchSize))
      
      if (insertError) {
        console.error('[API/admin/notifications] In-app persistence error:', insertError)
      }
    }
  }

  // 4. Background Email Delivery (Async)
  if (sendImmediately && recipientEmails.length > 0) {
    const processEmailSending = async () => {
      try {
        console.log(`[API/admin/notifications] Starting background email delivery to ${recipientEmails.length} users...`)
        
        const emailHtml = getNotificationEmailTemplate({
          subject: subject || 'New Update',
          content: content,
          type: type as 'email' | 'push',
          appUrl: process.env.MAIN_APP_URL
        })

        const emailBatchSize = 50
        for (let i = 0; i < recipientEmails.length; i += emailBatchSize) {
          const batch = recipientEmails.slice(i, i + emailBatchSize)
          const { data, error: resendError } = await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: batch,
            subject: (type === 'push' ? '🔔 ' : '') + (subject || 'New Notification'),
            html: emailHtml,
          })
          
          if (resendError) {
            console.error('[API/admin/notifications] Resend batch error:', resendError)
          } else {
            console.log('[API/admin/notifications] Email batch sent:', (data as any)?.id)
          }
        }

        await adminClient
          .from('notifications')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', notification.id)
          
        console.log('[API/admin/notifications] Full delivery process complete.')
      } catch (err) {
        console.error('[API/admin/notifications] Critical background error:', err)
        await adminClient
          .from('notifications')
          .update({ status: 'failed' })
          .eq('id', notification.id)
      }
    }
    
    processEmailSending()
  }

  // 4. Audit Log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'notification.sent',
    targetType: 'notification',
    targetId: notification.id,
    details: { type, category, targetType, recipientCount: recipients.length },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json(notification)
}

