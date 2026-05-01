import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { apiUsageEvents, users, apiKeys } from '@/lib/db/schema';
import { eq, between, desc, sql, count } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return apiError('FORBIDDEN', 'Authentication required', 401);
  
  const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!userRecord[0]?.isAdmin) {
    return apiError('FORBIDDEN', 'Admin access required', 403);
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '24h';
  const now = new Date();
  const startDate = new Date(now.getTime() - (range === '7d' ? 7 * 86400000 : range === '30d' ? 30 * 86400000 : 24 * 60 * 60 * 1000));

  // Summary
  const totalCallsResult = await db.select({ value: count() }).from(apiUsageEvents).where(between(apiUsageEvents.calledAt, startDate, now));
  const totalCalls = Number(totalCallsResult[0]?.value || 0);

  // By endpoint aggregation (top 20)
  const byEndpoint = await db
    .select({
      endpoint: apiUsageEvents.endpoint,
      calls: count(),
      avgLatency: sql<number>`AVG(latency_ms)`.as('avg_latency'),
      errorRate: sql<number>`AVG(CASE WHEN status_code >= 400 THEN 1.0 ELSE 0 END)`.as('error_rate'),
    })
    .from(apiUsageEvents)
    .where(between(apiUsageEvents.calledAt, startDate, now))
    .groupBy(apiUsageEvents.endpoint)
    .orderBy(desc(count()))
    .limit(20);

  // By plan
  const byPlan = await db
    .select({
      plan: users.plan,
      calls: count(),
    })
    .from(apiUsageEvents)
    .innerJoin(users, eq(apiUsageEvents.userId, users.id))
    .where(between(apiUsageEvents.calledAt, startDate, now))
    .groupBy(users.plan);

  // Top users by calls
  const topUsers = await db
    .select({
      userId: users.id,
      userEmail: users.email,
      plan: users.plan,
      keys: sql<number>`COUNT(DISTINCT ${apiKeys.id})`.as('keys'),
      calls: count(),
      errorRate: sql<number>`AVG(CASE WHEN ${apiUsageEvents.statusCode} >= 400 THEN 1.0 ELSE 0 END)`.as('error_rate'),
    })
    .from(apiUsageEvents)
    .innerJoin(users, eq(apiUsageEvents.userId, users.id))
    .leftJoin(apiKeys, eq(apiUsageEvents.apiKeyId, apiKeys.id))
    .where(between(apiUsageEvents.calledAt, startDate, now))
    .groupBy(users.id, users.email, users.plan)
    .orderBy(desc(count()))
    .limit(20);

  return apiSuccess({
    summary: { total_calls: totalCalls, range: range },
    by_endpoint: byEndpoint.map(r => ({
      endpoint: r.endpoint,
      calls: Number(r.calls),
      avg_latency_ms: Math.round(Number(r.avgLatency || 0)),
      error_rate: Number(r.errorRate || 0),
    })),
    by_plan: byPlan.map(p => ({ plan: p.plan, calls: Number(p.calls) })),
    top_users: topUsers.map(u => ({
      user_id: u.userId,
      email: u.userEmail,
      plan: u.plan,
      keys_count: Number(u.keys),
      calls: Number(u.calls),
      error_rate: Number(u.errorRate || 0),
    })),
  });
}
