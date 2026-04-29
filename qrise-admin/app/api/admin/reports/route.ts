import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const searchQuery = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const adminClient = createAdminClient()

  console.log('Reports API Call:', { status, searchQuery, page, offset })

  let query = adminClient
    .from('abuse_reports')
    .select('*, qr_codes(name, short_code, user_id), users!abuse_reports_reported_by_fkey(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (searchQuery) {
    query = query.ilike('reason', `%${searchQuery}%`)
  }

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count })
}
