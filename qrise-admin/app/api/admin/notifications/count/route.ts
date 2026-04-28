import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { searchParams } = new URL(request.url)
  const targetType = searchParams.get('targetType') || 'all'
  const targetPlan = searchParams.get('targetPlan')
  const targetId = searchParams.get('targetId')

  const adminClient = createAdminClient()
  let query = adminClient.from('users').select('*', { count: 'exact', head: true })

  if (targetType === 'user' && targetId) {
    // Check if targetId is a valid UUID to avoid Postgres error when comparing string to UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)
    if (isUuid) {
      query = query.or(`id.eq.${targetId},email.eq.${targetId}`)
    } else {
      query = query.eq('email', targetId)
    }
  } else if (targetType === 'plan' && targetPlan) {
    query = query.eq('plan', targetPlan.toLowerCase())
  }

  const { count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ count: count || 0 })
}
