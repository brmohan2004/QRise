import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys, usageMonthlySnapshots, users, apiUsageEvents } from '@/lib/db/schema';
import { eq, sql, between, and } from 'drizzle-orm';
import { redis, getPlanRateLimits } from '@/lib/api/rate-limit-config';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  
  if (!secret || !auth || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  // Get the start of the previous month (the one we are snapshotting)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const snapshotMonthStr = lastMonth.toISOString().split('T')[0].substring(0, 7) + '-01'; // YYYY-MM-01
  
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  try {
    // 1. Reset api_keys.calls_this_month = 0 and update calls_reset_at
    await db.update(apiKeys)
      .set({ 
        callsThisMonth: 0, 
        callsResetAt: nextMonthStart 
      });

    // 2. Snapshot each user's usage into usage_monthly_snapshots
    const allUsers = await db.select({ id: users.id, plan: users.plan }).from(users);
    
    for (const u of allUsers) {
      // Aggregate usage events for the current user for the month being snapshotted
      const usageStats = await db
        .select({
          unit: apiUsageEvents.billableUnit,
          total: sql<number>`SUM(quantity)`,
        })
        .from(apiUsageEvents)
        .where(
          and(
            eq(apiUsageEvents.userId, u.id),
            eq(apiUsageEvents.environment, 'live'),
            between(apiUsageEvents.calledAt, lastMonth, now)
          )
        )
        .groupBy(apiUsageEvents.billableUnit);

      const stats = {
        api_call: 0,
        image_render: 0,
        embed_render: 0,
        resolver_call: 0
      };

      usageStats.forEach(s => {
        if (s.unit && s.unit in stats) {
          stats[s.unit as keyof typeof stats] = s.total;
        }
      });

      await db.insert(usageMonthlySnapshots)
        .values({
          userId: u.id,
          month: snapshotMonthStr,
          apiCalls: stats.api_call,
          imageRenders: stats.image_render,
          embedRenders: stats.embed_render,
          resolverCalls: stats.resolver_call,
        })
        .onConflictDoNothing();

      // 3. Clear Redis quota exceeded flags for each user
      if (redis) {
        await redis.del(`quota_exceeded:${u.id}`);
        await redis.del(`alert_sent:usage:${u.id}`); // Clear alert dedup keys too
      }

      // 4. Fire usage.threshold_reached with reset for each user
      const planLimits = await getPlanRateLimits(u.plan);
      await fireWebhookEvent({
        userId: u.id,
        event: 'usage.threshold_reached',
        payload: { 
          pct: 0, 
          used: 0, 
          limit: planLimits.apiCallsPerMonth, 
          reset: true 
        },
      });
    }

    return NextResponse.json({ 
      ok: true, 
      snapshot_month: snapshotMonthStr,
      reset_at: nextMonthStart.toISOString() 
    });
  } catch (error) {
    console.error('Usage reset failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
