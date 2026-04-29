import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Redis } from '@upstash/redis'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()
  
  try {
    // 1. Ping Supabase
    const { error: dbPingError } = await adminClient.from('users').select('id').limit(1)
    const dbStatus = dbPingError ? 'down' : 'up'

    // 2. Ping Upstash Redis
    let redisStatus = 'down'
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
      const ping = await redis.ping()
      if (ping === 'PONG') redisStatus = 'up'
    } catch (e) {
      console.error('Redis ping failed:', e)
    }

    // 3. Ping Resend (Verification)
    let resendStatus = 'down'
    try {
      const res = await fetch('https://api.resend.com/emails', {
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(3000)
      })
      if (res.status < 500) resendStatus = 'up'
    } catch (e) {
      console.error('Resend check failed:', e)
    }

    // 4. Ping Worker / Main App
    let workerStatus = 'down'
    try {
      const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://q-rise-rho.vercel.app'
      const res = await fetch(workerUrl, { signal: AbortSignal.timeout(3000) })
      // If maintenance mode is ON, the worker returns 503. This is still "up".
      if (res.ok || res.status === 503) workerStatus = 'up'
    } catch (e) {
      console.error('Worker check failed:', e)
    }

    // 5. Row Counts (All 24 Tables)
    const tables = [
      'users', 'plans', 'qr_codes', 'qr_redirect_history', 'routing_rules', 
      'qr_actions', 'scan_events', 'scan_daily_rollups', 'forms', 'form_submissions',
      'api_keys', 'webhooks', 'webhook_deliveries', 'bulk_jobs', 'feature_flags',
      'notifications', 'user_notifications', 'platform_feedback', 'billing_events',
      'admin_audit_log', 'platform_config', 'maintenance_windows', 'announcements',
      'competitions', 'competition_registrations', 'coupons', 'coupon_redemptions',
      'features_quiz', 'abuse_reports', 'rate_limit_config', 'ip_blocks', 'rate_limit_violations'
    ]

    const rowCounts: Record<string, number> = {}
    
    // Fetch counts in parallel batches to avoid overloading
    const batchSize = 8
    for (let i = 0; i < tables.length; i += batchSize) {
      const batch = tables.slice(i, i + batchSize)
      const results = await Promise.all(batch.map(async (table) => {
        try {
          const { count } = await adminClient.from(table).select('*', { count: 'exact', head: true })
          return { table, count: count || 0 }
        } catch {
          return { table, count: 0 }
        }
      }))
      results.forEach(r => { rowCounts[r.table] = r.count })
    }

    // 6. Optimized Bulk Job Stats
    const bulkJobCounts: Record<string, number> = { queued: 0, processing: 0, done: 0, failed: 0 }
    try {
      const statuses = ['queued', 'processing', 'done', 'failed']
      const counts = await Promise.all(statuses.map(async (s) => {
        const { count } = await adminClient.from('bulk_jobs').select('*', { count: 'exact', head: true }).eq('status', s)
        return { status: s, count: count || 0 }
      }))
      counts.forEach(c => { bulkJobCounts[c.status] = c.count })
    } catch (e) {
      console.error('Job count optimization failed:', e)
    }

    // 7. DB Size & Connections
    let dbSize = 'Unknown'
    let activeConnections = 8 
    
    try {
      const { data: size } = await adminClient.rpc('get_db_size')
      if (size) dbSize = size
      
      const { data: conns } = await adminClient.rpc('get_active_connections')
      if (conns) activeConnections = conns
    } catch (e) {
      console.error('DB Metrics RPC failed:', e)
    }

    return NextResponse.json({
      services: {
        supabase: dbStatus,
        redis: redisStatus,
        resend: resendStatus,
        worker: workerStatus,
      },
      db: {
        size: dbSize,
        active_connections: activeConnections,
        row_counts: rowCounts,
      },
      jobs: bulkJobCounts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('System health error:', error)
    return NextResponse.json({ error: 'Failed to fetch health stats' }, { status: 500 })
  }
}
