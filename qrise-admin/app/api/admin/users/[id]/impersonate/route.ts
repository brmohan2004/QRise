import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { id } = await params
  const adminClient = createAdminClient()

  // 1. Get user email
  const { data: user, error: userError } = await adminClient
    .from('users')
    .select('email')
    .eq('id', id)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 2. Generate magic link for the user (impersonation)
  // In a real app, you might use a custom claim or a special token.
  // For this prompt, we'll use the Supabase Admin API to generate a link.
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email,
    options: {
      redirectTo: `${process.env.MAIN_APP_URL}/dashboard?impersonated=true`
    }
  })

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 })
  }

  // 3. Write audit log (SENSITIVE)
  await adminClient.from('admin_audit_log').insert({
    admin_user_id: admin.adminId,
    action: 'user.impersonate',
    target_type: 'user',
    target_id: id,
    details: { email: user.email },
    ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1'
  })

  return NextResponse.json({ url: linkData.properties.action_link })
}
