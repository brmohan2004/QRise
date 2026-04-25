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
  const { plan, expiresAt } = await request.json()
  const adminClient = createAdminClient()

  // Get current plan for audit log
  const { data: currentUser } = await adminClient
    .from('users')
    .select('plan')
    .eq('id', id)
    .single()

  const { error: updateError } = await adminClient
    .from('users')
    .update({
      plan,
      plan_expires_at: expiresAt || null
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'user.plan_change',
    targetType: 'user',
    targetId: id,
    details: { 
      old_plan: currentUser?.plan, 
      new_plan: plan,
      expires_at: expiresAt
    },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
