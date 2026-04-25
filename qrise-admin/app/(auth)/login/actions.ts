'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

// Initialize rate limiter
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '15 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/login',
})

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  // 1. Validation
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  // 2. Check allowlist (server-side)
  const allowList = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',') || []
  if (!allowList.includes(email)) {
    return { error: 'Access denied. Contact your system administrator.' }
  }

  // 3. Check if user is admin in DB
  const { data: userProfile, error: profileError } = await adminClient
    .from('users')
    .select('is_admin')
    .eq('email', email)
    .single()

  if (profileError || !userProfile?.is_admin) {
    return { error: 'Access denied. Account is not configured as an administrator.' }
  }

  // Note: The prompt says "Email must be in allowlist", it doesn't explicitly 
  // say we must check the DB here, but it's safer. 
  // However, magic link auth doesn't create users if shouldCreateUser is false.
  
  // 4. Rate limiting
  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1'
  const { success } = await ratelimit.limit(`${email}:${ip}`)
  
  if (!success) {
    return { error: 'Too many login attempts. Please try again in 15 minutes.' }
  }

  // 5. Send Magic Link
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Only existing admins can log in
      emailRedirectTo: `${process.env.MAIN_APP_URL}/api/auth/callback`,
    },
  })

  if (error) {
    console.error('Login error:', error)
    return { error: 'Failed to send magic link. Please try again.' }
  }

  return { success: true }
}

import * as jose from 'jose'
import { cookies } from 'next/headers'

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // 1. Validation
  if (!email || !password) {
    return { error: 'Please enter both email and password.' }
  }

  // 2. Check against .env.local
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new jose.SignJWT({ 
      id: 'admin_env_user', 
      email, 
      is_admin: true 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(secret)
    
    // set cookie using cookies()
    const cookieStore = await cookies()
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60,
      path: '/'
    })

    return { success: true }
  } else {
    return { error: 'Invalid email or password.' }
  }
}
