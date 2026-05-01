import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiUsageEvents, apiKeys, users, customQrTypes, qrCodes } from '@/lib/db/schema';
import { eq, between, sql, and, count } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getPlanRateLimits } from '@/lib/api/rate-limit-config';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export const GET = withApiAuth(async (req, ctx) => {
  const { user } = ctx;
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get('month'); // YYYY-MM

  const now = new Date();
  let year: number, mon: number;
  if (monthParam) {
    const parts = monthParam.split('-');
    year = parseInt(parts[0]);
    mon = parseInt(parts[1]) - 1; // 0-indexed
  } else {
    year = now.getFullYear();
    mon = now.getMonth();
  }

  const startDate = new Date(year, mon, 1);
  const endDate = new Date(year, mon + 1, 0, 23, 59, 59, 999);
  const resetsAt = new Date(year, mon + 1, 1);

  // Get user's plan and limits
  const userData = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const planName = userData[0]?.plan || 'free';
  const limits = await getPlanRateLimits(planName);

  // Sum API calls this month from api_keys
  const keyStats = await db
    .select({
      total: sql<number>`COALESCE(SUM(calls_this_month), 0)`,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id));

  const used = Number(keyStats[0]?.total || 0);
  
  // Get counts for other resources
  const [typesCount, qrsCount] = await Promise.all([
    db.select({ count: count() }).from(customQrTypes).where(eq(customQrTypes.userId, user.id)),
    db.select({ count: count() }).from(qrCodes).where(eq(qrCodes.userId, user.id)),
  ]);

  const currentTypes = Number(typesCount[0]?.count || 0);
  const currentQrs = Number(qrsCount[0]?.count || 0);

  // Consumption breakdown by daily rollups from api_usage_events
  const dailyData = await db
    .select({
      day: sql<string>`DATE(called_at)::TEXT`,
      calls: count(),
    })
    .from(apiUsageEvents)
    .where(
      and(
        eq(apiUsageEvents.userId, user.id),
        between(apiUsageEvents.calledAt, startDate, endDate),
        eq(apiUsageEvents.environment, 'live')
      )
    )
    .groupBy(sql`DATE(called_at)`);

  const dailyMap = new Map(dailyData.map(d => [d.day, Number(d.calls)]));

  const by_day: { date: string; api_calls: number }[] = [];
  const daysInMonth = getDaysInMonth(year, mon);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(mon + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    by_day.push({ 
      date: dateStr, 
      api_calls: dailyMap.get(dateStr) || 0 
    });
  }

  // by_endpoint aggregation from api_usage_events
  const endpointData = await db
    .select({
      endpoint: apiUsageEvents.endpoint,
      calls: count(),
      avgLatency: sql<number>`AVG(latency_ms)`,
      errorRate: sql<number>`AVG(CASE WHEN status_code >= 400 THEN 1.0 ELSE 0 END)`,
    })
    .from(apiUsageEvents)
    .where(
      and(
        eq(apiUsageEvents.userId, user.id),
        between(apiUsageEvents.calledAt, startDate, endDate),
        eq(apiUsageEvents.environment, 'live')
      )
    )
    .groupBy(apiUsageEvents.endpoint);

  const by_endpoint = endpointData.map(r => ({
    endpoint: r.endpoint,
    calls: Number(r.calls),
    avg_latency_ms: Math.round(Number(r.avgLatency || 0)),
    error_rate: parseFloat(Number(r.errorRate || 0).toFixed(4)),
  }));

  return apiSuccess({
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      resets_at: resetsAt.toISOString(),
    },
    api_calls: { 
      current: used, 
      limit: limits.apiCallsPerMonth,
    },
    custom_types: {
      current: currentTypes,
      limit: limits.maxCustomTypes,
    },
    dynamic_qrs: {
      current: currentQrs,
      limit: limits.maxDynamicQrs || 50, // Fallback if not in limits
    },
    consumed: {
      api_calls: { 
        used, 
        limit: limits.apiCallsPerMonth, 
        remaining: Math.max(0, limits.apiCallsPerMonth - used), 
        pct: limits.apiCallsPerMonth > 0 ? Math.round((used / limits.apiCallsPerMonth) * 100) : 0 
      },
      image_renders: { used: 0, limit: limits.imageRendersPerMonth, remaining: limits.imageRendersPerMonth, pct: 0 },
      embed_renders: { used: 0, limit: limits.embedRendersPerMonth, remaining: limits.embedRendersPerMonth, pct: 0 },
      resolver_calls: { used: 0, limit: limits.resolverCallsPerMonth, remaining: limits.resolverCallsPerMonth, pct: 0 },
    },
    by_day,
    by_endpoint,
    overage: { calls: 0, estimated_usd: 0 },
  });
});


