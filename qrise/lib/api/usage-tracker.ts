import { db } from '@/lib/db';
import { apiKeys, apiUsageEvents, users, usageMonthlySnapshots } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { redis } from '@/lib/api/rate-limit-config';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';
import { getPlanRateLimits } from '@/lib/api/rate-limit-config';
import { usageAlertChannels, type UsageAlertChannel } from '@/lib/db/schema';
import { buildSlackAlert, buildDiscordAlert } from '@/lib/billing/alert-formatters';
import { sendUsageAlertEmail } from '@/lib/resend';
import { and } from 'drizzle-orm';

export async function trackUsage(opts: {
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  requestId: string;
  environment: 'live' | 'test' | 'int';
  billableUnit: 'api_call' | 'image_render' | 'embed_render' | 'resolver_call';
  quantity?: number;
}): Promise<void> {
  const { apiKeyId, userId, endpoint, method, statusCode, latencyMs, requestId, environment, billableUnit, quantity = 1 } = opts;

  if (environment === 'test') {
    const debugKey = `debug:usage:test:${Date.now()}`;
    if (redis) {
      await redis.incr(debugKey).catch(console.error);
      await redis.expire(debugKey, 3600).catch(console.error);
    }
    return;
  }

  // Fire-and-forget insert into api_usage_events
  const insertUsage = async () => {
    try {
      await db.insert(apiUsageEvents).values({
        apiKeyId,
        userId,
        endpoint,
        method,
        statusCode,
        latencyMs,
        billableUnit,
        quantity,
        environment,
        requestId,
        calledAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to insert usage event:', err);
    }
  };

  // In Next.js edge runtime we'd use ctx.waitUntil, here use setTimeout
  setTimeout(insertUsage, 0);

  // Atomically increment calls_this_month on api_keys
  try {
    await db
      .update(apiKeys)
      .set({ callsThisMonth: sql`${apiKeys.callsThisMonth} + ${quantity}` })
      .where(eq(apiKeys.id, apiKeyId));
  } catch (err) {
    console.error('Failed to increment api_key usage:', err);
  }

  // Check 80% threshold and quota exceeded
  try {
    const keyRecords = await db
      .select({ callsThisMonth: apiKeys.callsThisMonth, callsResetAt: apiKeys.callsResetAt })
      .from(apiKeys)
      .where(eq(apiKeys.id, apiKeyId))
      .limit(1);

    if (keyRecords[0]) {
      const key = keyRecords[0];

      // Get user's plan and effective limits
      const userRecords = await db
        .select({ plan: users.plan })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const planName = userRecords[0]?.plan || 'free';
      const planLimits = await getPlanRateLimits(planName);
      // Note: user overrides already applied in auth middleware; we don't re-fetch here
      const limit = planLimits.apiCallsPerMonth;
      const consumed = key.callsThisMonth || 0;
      const pct = (consumed / limit) * 100;

      if (pct >= 80) {
        const dedupKey = `usage_threshold:${userId}:${new Date().getFullYear()}-${new Date().getMonth()}`;
        const already = redis ? await redis.get(dedupKey).catch(() => null) : null;
        if (!already) {
          await fireWebhookEvent({
            userId,
            event: 'usage.threshold_reached',
            payload: {
              percentage: Math.round(pct),
              used: key.callsThisMonth,
              limit,
              resetAt: key.callsResetAt?.toISOString(),
            },
          });
          if (redis) {
            await redis.set(dedupKey, '1', { ex: 30 * 86400 }).catch(console.error);
          }

          // NEW: Enhancement 8 - Dispatch to Slack/Discord/Email channels
          const channels = await db
            .select()
            .from(usageAlertChannels)
            .where(and(eq(usageAlertChannels.userId, userId), eq(usageAlertChannels.isActive, true)));

          for (const channel of channels) {
            if (pct >= (channel.thresholdPct || 80)) {
              await dispatchUsageAlert(channel, {
                pct: Math.round(pct),
                consumed: consumed,
                limit,
                unit: 'api_calls',
                resetAt: key.callsResetAt?.toISOString() || new Date().toISOString(),
                userEmail: userId, 
              }).catch(err => console.error('Failed to dispatch alert:', err));
            }
          }
        }
      }

      if (consumed >= limit) {
        const quotaKey = `quota_exceeded:${userId}`;
        const monthEnd = new Date(key.callsResetAt || new Date());
        const ttl = Math.max(0, monthEnd.getTime() - Date.now()) / 1000;
        if (redis) {
          await redis.set(quotaKey, '1', { ex: Math.max(1, Math.floor(ttl)) }).catch(console.error);
        }

        // Record overage for paid plans
        if (planName !== 'free') {
          const now = new Date();
          const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

          await db
            .insert(usageMonthlySnapshots)
            .values({
              userId,
              month: monthStr,
              overageCalls: quantity,
            })
            .onConflictDoUpdate({
              target: [usageMonthlySnapshots.userId, usageMonthlySnapshots.month],
              set: {
                overageCalls: sql`${usageMonthlySnapshots.overageCalls} + ${quantity}`,
              },
            }).catch(console.error);
        }
      }
    }
  } catch (err) {
    console.error('Threshold check failed:', err);
  }
}

/**
 * Dispatch usage alert to specific channel
 */
export async function dispatchUsageAlert(
  channel: UsageAlertChannel,
  opts: {
    pct: number;
    consumed: number;
    limit: number;
    unit: string;
    resetAt: string;
    userEmail: string;
    isTest?: boolean;
  }
): Promise<unknown> {
  const { pct, consumed, limit, unit, resetAt, userEmail, isTest } = opts;

  // Dedup in Redis unless it's a test
  if (!isTest && redis) {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const dedupKey = `alert_sent:${channel.id}:${year}-${month}`;
    const sent = await redis.get(dedupKey).catch(() => null);
    if (sent) return { skipped: true, reason: 'already_sent_this_month' };
    await redis.set(dedupKey, '1', { ex: 31 * 86400 }).catch(console.error);
  }

  if (channel.channelType === 'slack' && channel.webhookUrl) {
    const payload = buildSlackAlert({ userEmail, pct, consumed, limit, unit, resetAt });
    const res = await fetch(channel.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.status;
  }

  if (channel.channelType === 'discord' && channel.webhookUrl) {
    const payload = buildDiscordAlert({ userEmail, pct, consumed, limit, unit, resetAt });
    const res = await fetch(channel.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.status;
  }

  if (channel.channelType === 'email' && (channel.email || userEmail)) {
    await sendUsageAlertEmail({
      to: channel.email || userEmail,
      pct,
      consumed,
      limit,
      unit,
      resetAt,
    });
    return 'email_sent';
  }

  return { error: 'invalid_channel_config' };
}

