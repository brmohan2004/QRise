import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit';

const CRON_JOBS = [
  { name: 'cleanup', description: 'Cleans up expired temporary data and old logs' },
  { name: 'reset-api-counts', description: 'Resets daily API usage counters for all users' },
  { name: 'retry-webhooks', description: 'Attempts to redeliver failed webhooks' },
  { name: 'sync-stripe', description: 'Synchronizes subscription data with Stripe' },
  { name: 'generate-daily-reports', description: 'Aggregates scan data for daily reports' },
  { name: 'check-system-health', description: 'Verifies connectivity to all 3rd party services' },
  { name: 'prune-audit-logs', description: 'Archives or deletes admin logs older than 90 days' },
  { name: 'warm-cache', description: 'Pre-populates Redis with common platform data' },
  { name: 'verify-subscriptions', description: 'Deep audit of DB records vs Stripe status' },
  { name: 'clear-expired-blocks', description: 'Removes outdated IP bans from the security system' }
];

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  // In a real system, you might fetch last run times from a `cron_job_history` table.
  // For now, we'll return the list of allowed jobs.
  return NextResponse.json(CRON_JOBS);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { jobName } = await request.json();

  if (!jobName || !CRON_JOBS.find(j => j.name === jobName)) {
    return NextResponse.json({ error: 'Invalid job name' }, { status: 400 });
  }

  try {
    const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://q-rise-rho.vercel.app';
    const response = await fetch(`${mainAppUrl}/api/cron/${jobName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Cron trigger failed: ${response.statusText}`);
    }

    await writeAuditLog({
      adminUserId: admin.adminId,
      action: 'infra.cron_triggered',
      targetType: 'system',
      targetId: jobName,
      ipAddress: admin.ipAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cron trigger error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
