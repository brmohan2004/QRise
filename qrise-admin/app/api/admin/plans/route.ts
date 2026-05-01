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

  const { 
    rpm, rpd, max_burst, 
    image_renders_per_month, embed_renders_per_month, 
    resolver_calls_per_month, api_calls_per_month,
    max_webhooks, max_custom_types, max_resolver_timeout_ms,
    ...planData 
  } = await request.json()
  
  const adminClient = createAdminClient()

  // 1. Create Plan
  const { data: newPlan, error } = await adminClient
    .from('plans')
    .insert([planData])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 2. Create Rate Limits
  const limitsData = {
    rpm, rpd, max_burst,
    image_renders_per_month, embed_renders_per_month,
    resolver_calls_per_month, api_calls_per_month,
    max_webhooks, max_custom_types, max_resolver_timeout_ms,
    plan: newPlan.name.toLowerCase()
  }

  const { error: limitError } = await adminClient
    .from('plan_rate_limits')
    .upsert(limitsData, { onConflict: 'plan' })

  if (limitError) {
    console.error('Failed to initialize rate limits for new plan:', limitError)
  }

  // Audit log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'plan.create',
    targetType: 'plan',
    targetId: newPlan.id,
    details: { ...planData, ...limitsData },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ ...newPlan, ...limitsData })
}
