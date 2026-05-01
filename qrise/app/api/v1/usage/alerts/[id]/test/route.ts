import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usageAlertChannels } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { dispatchUsageAlert } from '@/lib/api/usage-tracker';

export const POST = withApiAuth(async (req, ctx) => {
  const { user } = ctx;
  const { id } = req.params as { id: string };

  const channelRecords = await ctx.db
    .select()
    .from(usageAlertChannels)
    .where(and(eq(usageAlertChannels.id, id), eq(usageAlertChannels.userId, user.id)))
    .limit(1);

  const channel = channelRecords[0];
  if (!channel) return apiError('NOT_FOUND', 'Channel not found.', 404);

  try {
    const res = await dispatchUsageAlert(channel, {
      pct: 85,
      consumed: 850,
      limit: 1000,
      unit: 'api_calls',
      resetAt: new Date(Date.now() + 86400000 * 5).toISOString(),
      userEmail: user.email,
      isTest: true
    });

    return apiSuccess({ delivered: true, response: res });
  } catch (err: any) {
    return apiError('UNKNOWN_ERROR', err.message || 'Failed to send test notification.', 500);
  }
}, undefined);
