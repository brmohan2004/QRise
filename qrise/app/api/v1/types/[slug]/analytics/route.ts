import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customQrTypes, typeResolvers, resolverCalls } from '@/lib/db/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';

export const GET = withApiAuth(async (req, ctx) => {
  const { hasScope } = ctx;
  if (!hasScope(SCOPES.TYPES_READ)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:read scope.', 403);

  const slug = req.params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug is required.', 400);

  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '7d';

  // 1. Find the type
  const typeRecords = await db.select().from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  const typeRecord = typeRecords[0];
  if (!typeRecord) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);

  // 2. Find the resolver
  const resolvers = await db.select().from(typeResolvers).where(eq(typeResolvers.typeId, typeRecord.id)).limit(1);
  const resolver = resolvers[0];
  if (!resolver) return apiError('RESOLVER_NOT_CONFIGURED', 'No resolver configured for this type.', 404);

  // Calculate start date
  const startDate = new Date();
  if (range === '24h') startDate.setHours(startDate.getHours() - 24);
  else if (range === '30d') startDate.setDate(startDate.getDate() - 30);
  else startDate.setDate(startDate.getDate() - 7); // Default 7d

  // 3. Aggregate stats
  const stats = await db
    .select({
      total_calls: sql<number>`count(*)`,
      error_count: sql<number>`count(*) filter (where resolver_status >= 400 or resolver_status is null)`,
      avg_latency_ms: sql<number>`avg(resolver_latency_ms)`,
      fallback_count: sql<number>`count(*) filter (where fallback_used = true)`,
    })
    .from(resolverCalls)
    .where(
      and(
        eq(resolverCalls.resolverId, resolver.id),
        gte(resolverCalls.calledAt, startDate)
      )
    );

  const summary = {
    total_calls: Number(stats[0]?.total_calls || 0),
    error_count: Number(stats[0]?.error_count || 0),
    error_rate: stats[0]?.total_calls ? (Number(stats[0].error_count) / Number(stats[0].total_calls)) * 100 : 0,
    avg_latency_ms: Math.round(Number(stats[0]?.avg_latency_ms || 0)),
    fallback_count: Number(stats[0]?.fallback_count || 0),
    fallback_rate: stats[0]?.total_calls ? (Number(stats[0].fallback_count) / Number(stats[0].total_calls)) * 100 : 0,
  };

  // 4. By Day
  const byDay = await db
    .select({
      date: sql<string>`date_trunc('day', called_at)::date`,
      calls: sql<number>`count(*)`,
      errors: sql<number>`count(*) filter (where resolver_status >= 400 or resolver_status is null)`,
      avg_latency_ms: sql<number>`avg(resolver_latency_ms)`,
    })
    .from(resolverCalls)
    .where(
      and(
        eq(resolverCalls.resolverId, resolver.id),
        gte(resolverCalls.calledAt, startDate)
      )
    )
    .groupBy(sql`date_trunc('day', called_at)::date`)
    .orderBy(sql`date_trunc('day', called_at)::date`);

  // 5. Recent calls
  const recentCalls = await db
    .select()
    .from(resolverCalls)
    .where(eq(resolverCalls.resolverId, resolver.id))
    .orderBy(desc(resolverCalls.calledAt))
    .limit(50);

  return apiSuccess({
    summary,
    by_day: byDay.map(d => ({
      ...d,
      calls: Number(d.calls),
      errors: Number(d.errors),
      avg_latency_ms: Math.round(Number(d.avg_latency_ms || 0))
    })),
    recent_calls: recentCalls
  });
}, undefined);
