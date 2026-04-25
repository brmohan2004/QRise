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
  const { searchParams } = new URL(request.url)
  const fileType = searchParams.get('fileType')

  const adminClient = createAdminClient()

  // Get current
  const { data: comp } = await adminClient
    .from('competitions')
    .select('custom_page_html, custom_components_json, registration_form_schema')
    .eq('id', id)
    .single()

  // Get last 3 versions
  const { data: versions } = await adminClient
    .from('competition_file_versions')
    .select('*')
    .eq('competition_id', id)
    .eq('file_type', fileType)
    .order('created_at', { ascending: false })
    .limit(3)

  return NextResponse.json({ current: comp, history: versions })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const { fileType, content } = await request.json()
  
  if (content.length > 200 * 1024) {
    return NextResponse.json({ error: 'File too large (max 200KB)' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // 1. Update competition table
  const updateField = 
    fileType === 'page' ? 'custom_page_html' : 
    fileType === 'components' ? 'custom_components_json' : 
    'registration_form_schema'

  const { error: updateError } = await adminClient
    .from('competitions')
    .update({ [updateField]: content })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // 2. Store version snapshot
  await adminClient.from('competition_file_versions').insert({
    competition_id: id,
    file_type: fileType,
    content: content,
    created_by: admin.adminId
  })

  // 3. Audit
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'competition.file_upload',
    targetType: 'competition',
    targetId: id,
    details: { fileType },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true })
}
