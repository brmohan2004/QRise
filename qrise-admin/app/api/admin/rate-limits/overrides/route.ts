import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()

  // 1. Fetch API Key Overrides
  const { data: keyOverrides, error: kError } = await supabase
    .from('api_keys')
    .select('id, key_prefix, admin_call_limit_override')
    .not('admin_call_limit_override', 'is', null)

  // 2. Fetch User Overrides
  const { data: userOverrides, error: uError } = await supabase
    .from('users')
    .select('id, email, rate_limit_override')
    .not('rate_limit_override', 'is', null)

  if (kError || uError) {
    return NextResponse.json({ error: 'Failed to fetch overrides' }, { status: 500 })
  }

  const formattedOverrides = [
    ...(keyOverrides?.map(k => ({
      id: k.id,
      type: 'key',
      identifier: k.key_prefix || k.id,
      limits: k.admin_call_limit_override
    })) || []),
    ...(userOverrides?.map(u => ({
      id: u.id,
      type: 'user',
      identifier: u.email || u.id,
      limits: u.rate_limit_override
    })) || [])
  ]

  return NextResponse.json(formattedOverrides)
}
