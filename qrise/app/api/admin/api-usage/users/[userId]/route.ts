import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { apiUsageEvents, apiKeys, users } from '@/lib/db/schema';
import { eq, between, desc, sql, count, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const supabase = await createClient();
  const { data: { user: admin } } = await supabase.auth.getUser();
  
  if (!admin) return apiError('FORBIDDEN', 'Authentication required', 401);
  
  const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, admin.id)).limit(1);
  if (!userRecord[0]?.isAdmin) {
    return apiError('FORBIDDEN', 'Admin access required', 403);
  }

  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '7d';
  const now = new Date();
  const startDate = new Date(now.getTime() - (range === '30d' ? 30 * 86400000 : 7 * 86400000));

  // All api_keys for this user
  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      environment: apiKeys.environment,
      scopes: apiKeys.scopes,
      callsThisMonth: apiKeys.callsThisMonth,
      lastUsedAt: apiKeys.lastUsedAt,
      lastIp: apiKeys.lastIp,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));

  // Usage timeline
  const timeline = await db
    .select({
      date: sql<string>`TO_CHAR(called_at, 'YYYY-MM-DD')`.as('date'),
      calls: count(),
    })
    .from(apiUsageEvents)
    .where(
      and(
        eq(apiUsageEvents.userId, userId),
        between(apiUsageEvents.calledAt, startDate, now)
      )
    )
    .groupBy(sql`TO_CHAR(called_at, 'YYYY-MM-DD')`)
    .orderBy(desc(sql`TO_CHAR(called_at, 'YYYY-MM-DD')`));

  // By endpoint breakdown
  const byEndpoint = await db
    .select({
      endpoint: apiUsageEvents.endpoint,
      calls: count(),
      avgLatency: sql<number>`AVG(latency_ms)`.as('avg_latency'),
      errorRate: sql<number>`AVG(CASE WHEN status_code >= 400 THEN 1.0 ELSE 0 END)`.as('error_rate'),
    })
    .from(apiUsageEvents)
    .where(eq(apiUsageEvents.userId, userId))
    .groupBy(apiUsageEvents.endpoint);

  // Recent error events (status >= 400)
  const errors = await db
    .select()
    .from(apiUsageEvents)
    .where(
      and(
        eq(apiUsageEvents.userId, userId),
        between(apiUsageEvents.calledAt, new Date(now.getTime() - 86400000), now),
        sql`status_code >= 400`
      )
    )
    .orderBy(desc(apiUsageEvents.calledAt))
    .limit(50);

  return apiSuccess({
    user_id: userId,
    keys,
    timeline: timeline.map(t => ({ date: t.date, calls: Number(t.calls) })),
    by_endpoint: byEndpoint.map(e => ({
      endpoint: e.endpoint,
      calls: Number(e.calls),
      avg_latency: Math.round(Number(e.avgLatency || 0)),
      error_rate: Number(e.errorRate || 0),
    })),
    errors,
  });
}
