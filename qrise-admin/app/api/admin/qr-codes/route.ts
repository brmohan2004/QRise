import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()
  const { searchParams } = new URL(request.url)
  
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = adminClient
    .from('qr_codes')
    .select(`
      id,
      name,
      type,
      short_code,
      scan_count,
      is_active,
      created_at,
      user_id,
      users:user_id (email)
    `)
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (status === 'active') query = query.eq('is_active', true)
  if (status === 'suspended') query = query.eq('is_active', false)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data: qrCodes, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(qrCodes)
}
