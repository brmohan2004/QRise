import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const searchQuery = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const adminClient = createAdminClient()

  let query = adminClient
    .from('platform_feedback')
    .select('*, users:user_id(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  if (searchQuery && searchQuery !== 'undefined' && searchQuery !== '') {
    query = query.ilike('subject', `%${searchQuery}%`)
  }

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count })
}

export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json()
  if (!id || !status) return NextResponse.json({ error: 'ID and status required' }, { status: 400 })

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('platform_feedback')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('platform_feedback')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
