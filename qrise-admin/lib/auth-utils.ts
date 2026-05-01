import { cookies } from 'next/headers'
import * as jose from 'jose'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface AdminUser {
  id: string
  email: string
  isAdmin: boolean
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  
  // 1. Check for custom admin session (JWT)
  const adminToken = cookieStore.get('admin_session')?.value
  if (adminToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jose.jwtVerify(adminToken, secret)
      if (payload.is_admin && payload.email === process.env.ADMIN_EMAIL) {
        return {
          id: payload.id as string,
          email: payload.email as string,
          isAdmin: true
        }
      }
    } catch (e) {
      // Invalid token
    }
  }

  // 2. Check for Supabase session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check metadata
    const isAdminMetadata = user.app_metadata?.is_admin || user.user_metadata?.is_admin
    const allowList = process.env.ADMIN_EMAIL_ALLOWLIST?.split(",") || []
    const isEmailAllowed = allowList.includes(user.email || "") || user.email === process.env.ADMIN_EMAIL

    if (isAdminMetadata && isEmailAllowed) {
      return {
        id: user.id,
        email: user.email!,
        isAdmin: true
      }
    }

    // Check DB
    const adminClient = createAdminClient()
    const { data: userProfile } = await adminClient
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userProfile?.is_admin && isEmailAllowed) {
      return {
        id: user.id,
        email: user.email!,
        isAdmin: true
      }
    }
  }

  return null
}
