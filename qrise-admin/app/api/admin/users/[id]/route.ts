import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const adminClient = createAdminClient()

  // 1. Fetch user profile
  const { data: user, error: userError } = await adminClient
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 404 })
  }

  // 2. Fetch user's QRs
  const { data: qrCodes } = await adminClient
    .from('qr_codes')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  // 3. Fetch recent scans (join with qr_codes for names)
  const { data: scans } = await adminClient
    .from('scan_events')
    .select(`
      id,
      created_at,
      country,
      device,
      qr_id,
      qr_codes (name)
    `)
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const formattedScans = scans?.map((s: { id: string; created_at: string; country: string; device: string; qr_codes?: any }) => ({
    id: s.id,
    created_at: s.created_at,
    country: s.country,
    device: s.device,
    qr_name: Array.isArray(s.qr_codes) ? s.qr_codes[0]?.name : s.qr_codes?.name || 'Deleted QR'
  }))

  return NextResponse.json({
    user,
    qrCodes: qrCodes || [],
    scans: formattedScans || []
  })
}
