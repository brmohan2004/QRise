import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  // 1. Get total violations today
  const { count: violationsToday, error: vError } = await supabase
    .from('rate_limit_violations')
    .select('*', { count: 'exact', head: true })
    .gt('created_at', todayISO)

  // 2. Get active IP blocks
  const { count: activeBlocks, error: bError } = await supabase
    .from('ip_blocks')
    .select('*', { count: 'exact', head: true })
    .is('unblocked_at', null)
    .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)

  // 3. Get top violating endpoints (last 24h)
  const { data: topEndpoints, error: eError } = await supabase
    .from('rate_limit_violations')
    .select('endpoint')
    .gt('created_at', new Date(Date.now() - 86400000).toISOString())
    .limit(100) // We'll aggregate manually since Supabase doesn't do GROUP BY easily in simple select

  const endpointStats = topEndpoints?.reduce((acc: any, curr: any) => {
    acc[curr.endpoint] = (acc[curr.endpoint] || 0) + 1
    return acc
  }, {})

  const sortedEndpoints = Object.entries(endpointStats || {})
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
    .map(([endpoint, count]) => ({ endpoint, count }))

  if (vError || bError || eError) {
    return NextResponse.json({ error: 'Failed to fetch overview stats' }, { status: 500 })
  }

  return NextResponse.json({
    violationsToday: violationsToday || 0,
    activeBlocks: activeBlocks || 0,
    topEndpoints: sortedEndpoints
  })
}
