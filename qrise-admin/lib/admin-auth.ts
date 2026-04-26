import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

export async function verifyAdmin(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()
  let user = supabaseUser;

  // Check for .env admin session regardless of Supabase session
  const adminToken = request.cookies.get('admin_session')?.value;
  if (adminToken) {
    try {
      const { jwtVerify } = await import('jose');
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(adminToken, secret);
      if (payload.is_admin && payload.email === process.env.ADMIN_EMAIL) {
        // Prioritize the admin user from the JWT
        user = {
          id: 'admin_env_user',
          email: payload.email as string,
          app_metadata: { is_admin: true },
          user_metadata: { is_admin: true },
          last_sign_in_at: new Date().toISOString()
        } as unknown as any;
      }
    } catch {
      // Invalid token, fall back to supabaseUser
    }
  }

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  // Check allowlist
  const allowList = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',') || []
  if (!allowList.includes(user.email || '') && user.email !== process.env.ADMIN_EMAIL) {
    return { error: 'Forbidden', status: 403 }
  }

  // Check DB for admin flag (Skip for hardcoded env user)
  if (user.id !== 'admin_env_user') {
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('users')
      .select('is_admin, is_suspended')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin || profile?.is_suspended) {
      return { error: 'Forbidden', status: 403 }
    }
  }

  // 5. Check session age < 8 hours
  const lastSignIn = new Date(user.last_sign_in_at || 0).getTime()
  const now = new Date().getTime()
  const hoursSinceLogin = (now - lastSignIn) / (1000 * 60 * 60)
  
  if (hoursSinceLogin > 8) {
    return { error: 'Session expired (8h limit)', status: 401 }
  }

  return { 
    user, 
    adminId: user.id, 
    ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1' 
  }
}
