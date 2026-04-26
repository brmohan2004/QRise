import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const { planId } = await request.json()
  const adminClient = createAdminClient()

  // 1. Get the plan name from the ID
  const { data: plan, error: planError } = await adminClient
    .from('plans')
    .select('name')
    .eq('id', planId)
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: 'Selected plan not found' }, { status: 404 })
  }

  // 2. Update the user's plan
  const { error: updateError } = await adminClient
    .from('users')
    .update({ 
      plan: plan.name.toLowerCase() 
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // 3. Write audit log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'user.plan_update',
    targetType: 'user',
    targetId: id,
    details: { new_plan: plan.name },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
