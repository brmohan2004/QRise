import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { table } = await request.json()

  if (!table) {
    return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
  }

  // List of allowed tables to clean (Safety check)
  const allowedTables = [
    'users', 'plans', 'qr_codes', 'qr_redirect_history', 'routing_rules',
    'qr_actions', 'scan_events', 'scan_daily_rollups', 'forms', 'form_submissions',
    'api_keys', 'webhooks', 'webhook_deliveries', 'bulk_jobs',
    'notifications', 'user_notifications', 'platform_feedback', 'billing_events',
    'admin_audit_log', 'platform_config', 'maintenance_windows', 'announcements',
    'competitions', 'competition_registrations', 'coupons', 'coupon_redemptions',
    'features_quiz', 'abuse_reports', 'rate_limit_config', 'ip_blocks', 'rate_limit_violations', 'plans', 'users'
  ]

  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: 'Invalid or restricted table' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  try {
    let query = adminClient.from(table).delete()

    // Safety: If cleaning users, don't delete the current admin
    if (table === 'users') {
      query = query.neq('id', admin.adminId)
    } else {
      // For other tables, we just need a condition that matches everything
      // Using neq on a likely non-existent ID or simply a broad filter
      query = query.neq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { error } = await query

    if (error) throw error

    // Audit Log
    await writeAuditLog({
      adminUserId: admin.adminId,
      action: 'system.db_clean',
      targetType: 'table',
      targetId: table,
      details: { table },
      ipAddress: admin.ipAddress
    })

    return NextResponse.json({ success: true, message: `Table ${table} cleaned successfully` })
  } catch (error: any) {
    console.error('DB clean error:', error)
    return NextResponse.json({ error: error.message || 'Failed to clean table' }, { status: 500 })
  }
}
