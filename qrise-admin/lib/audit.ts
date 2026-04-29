import { createAdminClient } from '@/lib/supabase/admin'

interface AuditEntry {
  adminUserId: string
  action: string
  targetType?: 'user' | 'qr_code' | 'plan' | 'feature_flag' | 'broadcast' | 'coupon' | 'competition' | 'notification' | 'abuse_report' | 'bug_report' | 'bulk_job' | 'features_quiz' | 'system' | 'table'
  targetId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

/**
 * Shared utility for writing administrative audit logs.
 * Ensuring traceability for all sensitive admin actions.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  const adminClient = createAdminClient()
  
  try {
    const { error } = await adminClient.from('admin_audit_log').insert({
      admin_user_id: entry.adminUserId,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      details: entry.details || {},
      ip_address: entry.ipAddress || '127.0.0.1',
      created_at: new Date().toISOString()
    })

    if (error) {
      console.error('[AUDIT ERROR]', error.message)
    }
  } catch (err) {
    console.error('[AUDIT EXCEPTION]', err)
  }
}
