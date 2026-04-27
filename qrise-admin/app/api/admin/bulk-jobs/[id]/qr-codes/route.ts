import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()

  const { data: qrCodes, error } = await adminClient
    .from('qr_codes')
    .select(`
      id,
      name,
      type,
      short_code,
      scan_count,
      is_active,
      status,
      created_at,
      user_id,
      users:user_id (email)
    `)
    .eq('bulk_job_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(qrCodes)
}
