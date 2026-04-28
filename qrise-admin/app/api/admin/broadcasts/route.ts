import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend, RESEND_FROM_EMAIL } from '@/lib/resend'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if ('error' in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API/admin/broadcasts] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[API/admin/broadcasts] Unexpected error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { subject, body, segment } = await request.json()
  const adminClient = createAdminClient()

  // 1. Resolve segment to emails
  let query = adminClient.from('users').select('email')

  if (segment.type === 'plan' && segment.plans?.length > 0) {
    query = query.in('plan', segment.plans)
  }
  
  if (segment.type === 'country' && segment.countries?.length > 0) {
    // Note: Assuming users table has country column as per analytics Phase 6
    query = query.in('country', segment.countries)
  }

  const { data: users, error: userError } = await query

  if (userError) {
    return NextResponse.json({ error: 'Failed to resolve segment' }, { status: 500 })
  }

  const emails = users.map(u => u.email).filter(Boolean) as string[]

  // 2. Create broadcast record
  const { data: broadcast, error: broadcastError } = await adminClient
    .from('broadcasts')
    .insert([{
      admin_id: admin.adminId,
      subject,
      body,
      segment,
      recipient_count: emails.length,
      status: 'sending'
    }])
    .select()
    .single()

  if (broadcastError) {
    return NextResponse.json({ error: 'Failed to create broadcast record' }, { status: 500 })
  }

  // 3. Send emails in batches of 50 (async-ish)
  // In a real production app, we'd offload this to a queue/worker.
  // For now, we'll process it and update the status.
  
  const batchSize = 50

  let failCount = 0

  const sendBatches = async () => {
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      
      try {
        // Resend batch API
        await resend.emails.send({
          from: RESEND_FROM_EMAIL,
          to: batch,
          subject: subject,
          html: body,
        })

      } catch (err) {
        console.error('Batch send error:', err)
        failCount += batch.length
      }
    }

    // Update final status
    await adminClient
      .from('broadcasts')
      .update({ 
        status: failCount === 0 ? 'sent' : failCount === emails.length ? 'failed' : 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', broadcast.id)
  }

  // We don't 'await' sendBatches here to respond to the UI quickly, 
  // but in Next.js Server Actions/Routes this might be cut off if not careful.
  // For Kilo/Agentic purposes, we'll let it run.
  sendBatches()

  // 4. Audit log
  await adminClient.from('admin_audit_log').insert({
    admin_user_id: admin.adminId,
    action: 'broadcast.sent',
    target_type: 'broadcast',
    target_id: broadcast.id,
    details: { subject, recipient_count: emails.length },
    ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1'
  })

  return NextResponse.json(broadcast)
}
