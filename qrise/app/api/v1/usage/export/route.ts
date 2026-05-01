import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiUsageEvents } from '@/lib/db/schema';
import { eq, between, and } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { format } from 'date-fns';

export const GET = withApiAuth(async (req, ctx) => {
  const { user } = ctx;
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get('month');

  const now = new Date();
  let year: number, mon: number;
  if (monthParam) {
    const parts = monthParam.split('-');
    year = parseInt(parts[0]);
    mon = parseInt(parts[1]) - 1;
  } else {
    year = now.getFullYear();
    mon = now.getMonth();
  }

  const startDate = new Date(year, mon, 1);
  const endDate = new Date(year, mon + 1, 0, 23, 59, 59, 999);

  const events = await db
    .select({
      id: apiUsageEvents.id,
      endpoint: apiUsageEvents.endpoint,
      method: apiUsageEvents.method,
      statusCode: apiUsageEvents.statusCode,
      latencyMs: apiUsageEvents.latencyMs,
      billableUnit: apiUsageEvents.billableUnit,
      quantity: apiUsageEvents.quantity,
      environment: apiUsageEvents.environment,
      calledAt: apiUsageEvents.calledAt,
    })
    .from(apiUsageEvents)
    .where(
      and(
        eq(apiUsageEvents.userId, user.id),
        between(apiUsageEvents.calledAt, startDate, endDate)
      )
    );

  const headers = ['id', 'endpoint', 'method', 'status_code', 'latency_ms', 'billable_unit', 'quantity', 'environment', 'called_at'];
  const csvRows = [
    headers.join(','),
    ...events.map(e => [
      e.id,
      e.endpoint,
      e.method,
      e.statusCode,
      e.latencyMs,
      e.billableUnit || '',
      e.quantity,
      e.environment,
      e.calledAt ? format(new Date(e.calledAt), 'yyyy-MM-dd HH:mm:ss') : '',
    ].map(v => `"${v}"`).join(',')),
  ].join('\n');

  return new NextResponse(csvRows, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="qrise-usage-${year}-${String(mon + 1).padStart(2, '0')}.csv"`,
    },
  });
}, undefined);


