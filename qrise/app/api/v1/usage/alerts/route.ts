import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { usageAlertChannels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';

export const GET = withApiAuth(async (req, ctx) => {
  const { user } = ctx;
  
  const channels = await ctx.db
    .select()
    .from(usageAlertChannels)
    .where(eq(usageAlertChannels.userId, user.id))
    .orderBy(desc(usageAlertChannels.createdAt));

  return apiSuccess({ channels });
}, undefined);

export const POST = withApiAuth(async (req, ctx) => {
  const { user } = ctx;
  const body = await req.json();
  const { channel_type, webhook_url, email, threshold_pct } = body;

  if (!channel_type || !['slack', 'discord', 'email'].includes(channel_type)) {
    return apiError('VALIDATION_ERROR', 'Valid channel_type is required (slack, discord, email).', 400);
  }

  if (channel_type !== 'email' && (!webhook_url || !webhook_url.startsWith('https://'))) {
    return apiError('VALIDATION_ERROR', 'webhook_url must be a valid HTTPS URL for slack/discord.', 400);
  }

  if (channel_type === 'email' && !email) {
    return apiError('VALIDATION_ERROR', 'email is required for email channel.', 400);
  }

  const created = await ctx.db
    .insert(usageAlertChannels)
    .values({
      userId: user.id,
      channelType: channel_type,
      webhookUrl: webhook_url,
      email: email,
      thresholdPct: threshold_pct || 80,
    })
    .returning();

  return apiSuccess(created[0]);
}, undefined);
