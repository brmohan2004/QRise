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

  // List of allowed tables to clean (Safety check - Includes all 41 public tables)
  const allowedTables = [
    'abuse_reports', 'admin_audit_log', 'announcements', 'api_keys',
    'api_usage_events', 'billing_events', 'bulk_jobs', 'competition_registrations',
    'competitions', 'coupon_redemptions', 'coupons', 'custom_qr_types', 'features_quiz', 'form_submissions', 'forms',
    'ip_blocks', 'maintenance_windows', 'notifications', 'plan_rate_limits',
    'plans', 'platform_feedback', 'qr_actions',
    'qr_codes', 'qr_redirect_history', 'rate_limit_violations', 'resolver_calls',
    'routing_rules', 'scan_daily_rollups', 'scan_events', 'type_marketplace_submissions',
    'type_resolvers', 'type_templates', 'usage_alert_channels', 'usage_monthly_snapshots',
    'user_notifications', 'user_rate_limit_overrides', 'users', 'webhook_deliveries', 'webhooks'
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
