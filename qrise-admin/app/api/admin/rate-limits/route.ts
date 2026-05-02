import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)

  if ('error' in admin) {
    console.log('[API] RateLimits: Unauthorized access attempt')
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()
  const { data: plans, error } = await adminClient
    .from('plan_rate_limits')
    .select('*')
    .order('plan', { ascending: true })

  if (error) {
    console.error('Error fetching rate limits:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ plans })
}
