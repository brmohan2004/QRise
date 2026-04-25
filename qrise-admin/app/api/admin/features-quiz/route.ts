import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('features_quiz')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const body = await request.json()
  const { feature_name, hint_text, answer, gift_code, image_url } = body

  if (!feature_name || !hint_text || !answer) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Hash the answer using SHA-256
  const answer_hash = crypto.createHash('sha256').update(answer.toLowerCase().trim()).digest('hex')

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('features_quiz')
    .insert({
      feature_name,
      hint_text,
      answer_hash,
      gift_code,
      image_url,
      is_visible: true,
      is_revealed: false
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'quiz.create',
    targetType: 'features_quiz',
    targetId: data.id,
    details: { feature_name },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json(data)
}
