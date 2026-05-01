import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const adminClient = createAdminClient()

  // Fetch plan
  const { data: plan, error } = await adminClient
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  // Fetch rate limits
  const { data: limits } = await adminClient
    .from('plan_rate_limits')
    .select('*')
    .eq('plan', plan.name.toLowerCase())
    .single()

  // Clean limits to avoid overwriting plan ID or timestamps
  const { id: _, updated_at: __, plan: ___, ...cleanLimits } = limits || {}

  return NextResponse.json({ ...plan, ...cleanLimits })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const { 
    rpm, rpd, max_burst, 
    image_renders_per_month, embed_renders_per_month, 
    resolver_calls_per_month, api_calls_per_month,
    max_webhooks, max_custom_types, max_resolver_timeout_ms,
    ...planData 
  } = await request.json()
  
  const adminClient = createAdminClient()

  // Get current state for audit
  const { data: currentPlan } = await adminClient
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  // Update Plan
  const { data: updatedPlan, error } = await adminClient
    .from('plans')
    .update(planData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update Rate Limits
  if (currentPlan) {
    const limitsData = {
      rpm, rpd, max_burst,
      image_renders_per_month, embed_renders_per_month,
      resolver_calls_per_month, api_calls_per_month,
      max_webhooks, max_custom_types, max_resolver_timeout_ms,
      plan: updatedPlan.name.toLowerCase()
    }

    // Upsert rate limits (using plan name as key)
    const { error: limitError } = await adminClient
      .from('plan_rate_limits')
      .upsert(limitsData, { onConflict: 'plan' })
    
    if (limitError) {
      console.error('Failed to update rate limits:', limitError)
      // We don't fail the whole request, but we log it
    }
  }

  // Audit log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'plan.update',
    targetType: 'plan',
    targetId: id,
    details: { before: currentPlan, after: { ...planData, rpm, rpd } },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ ...updatedPlan, rpm, rpd })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const adminClient = createAdminClient()

  // Check for users
  const { data: plan } = await adminClient.from('plans').select('name').eq('id', id).single()
  const { count } = await adminClient
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('plan', plan?.name?.toLowerCase())

  if (count && count > 0) {
    return NextResponse.json({ error: 'Cannot delete plan with active users' }, { status: 400 })
  }

  const { error } = await adminClient.from('plans').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
