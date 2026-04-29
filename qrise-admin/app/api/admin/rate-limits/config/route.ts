import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin-auth'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('rate_limit_config')
    .select('*')
    .order('plan_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json()
  const { plan_name, requests_per_minute, requests_per_hour, requests_per_day } = body

  if (!plan_name) return NextResponse.json({ error: 'Plan name is required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('rate_limit_config')
    .update({
      requests_per_minute,
      requests_per_hour,
      requests_per_day,
      updated_at: new Date().toISOString()
    })
    .eq('plan_name', plan_name)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Flush Redis cache for this plan
  await redis.del(`rate_limit_config:${plan_name}`)

  return NextResponse.json(data)
}
