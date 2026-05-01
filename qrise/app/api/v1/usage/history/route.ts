import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usageMonthlySnapshots } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess } from '@/lib/api/response';

export const GET = withApiAuth(async (req, ctx) => {
  const { user } = ctx;

  const snapshots = await db
    .select()
    .from(usageMonthlySnapshots)
    .where(eq(usageMonthlySnapshots.userId, user.id))
    .orderBy(desc(usageMonthlySnapshots.month))
    .limit(12);

  return apiSuccess({ snapshots });
}, undefined);


