import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()
  
  try {
    // A job is considered "stuck" if it has been in 'processing' state 
    // and hasn't been updated in over 1 hour.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: stuckJobs, error: fetchError } = await adminClient
      .from('bulk_jobs')
      .select('id')
      .eq('status', 'processing')
      .lt('updated_at', oneHourAgo)

    if (fetchError) throw fetchError

    if (!stuckJobs || stuckJobs.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No stuck jobs found' })
    }

    const jobIds = stuckJobs.map(j => j.id)

    const { error: updateError } = await adminClient
      .from('bulk_jobs')
      .update({ 
        status: 'failed', 
        error_message: 'Terminated: Job exceeded maximum processing time (stuck).',
        updated_at: new Date().toISOString()
      })
      .in('id', jobIds)

    if (updateError) throw updateError

    // Audit Log
    await writeAuditLog({
      adminUserId: admin.adminId,
      action: 'system.jobs_flush',
      targetType: 'system',
      targetId: 'bulk_jobs',
      details: { count: jobIds.length, jobIds },
      ipAddress: admin.ipAddress
    })

    return NextResponse.json({ 
      success: true, 
      count: jobIds.length, 
      message: `${jobIds.length} stuck jobs flushed successfully` 
    })
  } catch (error: any) {
    console.error('Job flush error:', error)
    return NextResponse.json({ error: error.message || 'Failed to flush jobs' }, { status: 500 })
  }
}
