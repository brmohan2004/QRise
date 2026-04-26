import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables in admin panel')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'abuse' // 'abuse' | 'bug'
  const status = searchParams.get('status')
  const searchQuery = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const adminClient = createAdminClient()

  if (type === 'abuse') {
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
  } else {
    let query = adminClient
      .from('bug_reports')
      .select('*, users!bug_reports_user_id_fkey(email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (searchQuery) {
      query = query.ilike('description', `%${searchQuery}%`)
    }

    const { data, count, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, total: count })
  }
}
