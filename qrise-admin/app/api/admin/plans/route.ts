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
  
  // Fetch plans and user counts per plan
  const { data: plans, error } = await adminClient
    .from('plans')
    .select('*')
    .order('price_monthly', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get user counts
  const plansWithCounts = await Promise.all(plans.map(async (plan) => {
    const { count } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('plan', plan.name.toLowerCase())
    
    return { ...plan, user_count: count || 0 }
  }))

  return NextResponse.json(plansWithCounts)
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const body = await request.json()
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('plans')
    .insert([body])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'plan.create',
    targetType: 'plan',
    targetId: data.id,
    details: body,
    ipAddress: admin.ipAddress
  })

  return NextResponse.json(data)
}
