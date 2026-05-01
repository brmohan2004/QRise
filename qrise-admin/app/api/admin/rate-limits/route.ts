import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser } from '@/lib/auth-utils'

export async function GET() {
  const user = await getAdminUser()

  if (!user) {
    console.log('[API] RateLimits: Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
