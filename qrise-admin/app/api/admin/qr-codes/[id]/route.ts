import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

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

  // 1. Fetch QR code details with owner
  const { data: qrCode, error: qrError } = await adminClient
    .from('qr_codes')
    .select(`
      *,
      users:user_id (id, email, full_name)
    `)
    .eq('id', id)
    .single()

  if (qrError) {
    return NextResponse.json({ error: qrError.message }, { status: 404 })
  }

  // 2. Fetch recent scan events
  const { data: scans } = await adminClient
    .from('scan_events')
    .select('*')
    .eq('qr_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({
    qrCode,
    scans: scans || []
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const { is_active } = await request.json()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('qr_codes')
    .update({ 
      is_active,
      status: is_active ? 'active' : 'suspended',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: `qr_code.${is_active ? 'activate' : 'suspend'}`,
    targetType: 'qr_code',
    targetId: id,
    details: { is_active },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('qr_codes')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'qr_code.delete',
    targetType: 'qr_code',
    targetId: id,
    details: { deleted: true },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}


