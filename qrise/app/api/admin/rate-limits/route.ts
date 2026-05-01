import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { planRateLimits, users, userRateLimitOverrides } from '@/lib/db/schema';
import { eq, sql, count } from 'drizzle-orm';
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

  // Get plans with their current limits
  const plans = await db.select().from(planRateLimits).orderBy(planRateLimits.plan);

  // Get override counts per plan
  // Note: userRateLimitOverrides doesn't store the plan directly, so we join with users
  const overrideCounts = await db
    .select({
      plan: users.plan,
      count: count(),
    })
    .from(userRateLimitOverrides)
    .innerJoin(users, eq(userRateLimitOverrides.userId, users.id))
    .groupBy(users.plan);

  const planList = plans.map(p => ({
    ...p,
    override_count: Number(overrideCounts.find(oc => oc.plan === p.plan)?.count || 0)
  }));

  return apiSuccess({ plans: planList });
}

