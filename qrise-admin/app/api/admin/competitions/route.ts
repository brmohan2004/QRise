import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('competitions')
    .select('*, registration_count:competition_registrations(count)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const competitions = data.map(comp => ({
    ...comp,
    registrations: comp.registration_count?.[0]?.count || 0
  }))

  return NextResponse.json(competitions)
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const body = await request.json()
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('competitions')
    .insert([body])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'competition.create',
    targetType: 'competition',
    targetId: data.id,
    details: body,
    ipAddress: admin.ipAddress
  })

  return NextResponse.json(data)
}
