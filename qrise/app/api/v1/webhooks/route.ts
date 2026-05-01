import { NextResponse } from 'next/server';

import { webhooks, users } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { randomBytes } from 'node:crypto';
import { getPlanRateLimits } from '@/lib/api/rate-limit-config';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';
import { createHash } from 'node:crypto';

export const GET = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.WEBHOOKS_MANAGE)) return apiError('INSUFFICIENT_SCOPE', 'Missing webhooks:manage scope.', 403);

  const whs = await ctx.db
    .select()
    .from(webhooks)
    .where(eq(webhooks.userId, user.id))
    .orderBy(desc(webhooks.createdAt));

  return apiSuccess({
    webhooks: whs.map(wh => ({
      ...wh,
      secret: maskSecret(wh.secret),
    })),
  });
});

export const POST = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.WEBHOOKS_MANAGE)) return apiError('INSUFFICIENT_SCOPE', 'Missing webhooks:manage scope.', 403);

  // Plan check: max webhooks
  const userRec = await ctx.db.select({ plan: users.plan }).from(users).where(eq(users.id, user.id)).limit(1);
  const planLimits = await getPlanRateLimits(userRec[0]?.plan || 'free');
  const countResult = await ctx.db
    .select({ count: sql<number>`COUNT(*)` })
    .from(webhooks)
    .where(eq(webhooks.userId, user.id));
  if (Number(countResult[0]?.count || 0) >= planLimits.maxWebhooks) {
    return apiError('PLAN_LIMIT_EXCEEDED', `Max ${planLimits.maxWebhooks} webhooks allowed.`, 403);
  }

  const body = await req.json();
  const { endpoint_url, events, filter_config } = body;

  if (!endpoint_url || !events?.length) {
    return apiError('VALIDATION_ERROR', 'endpoint_url and events are required.', 400);
  }
  if (!endpoint_url.startsWith('https://')) {
    return apiError('VALIDATION_ERROR', 'endpoint_url must be HTTPS.', 400);
  }

  const secret = randomBytes(32).toString('hex');

  const created = await ctx.db
    .insert(webhooks)
    .values({
      userId: user.id,
      endpointUrl: endpoint_url,
      events,
      filterConfig: filter_config,
      secret, // Store raw secret for signing in executor
    })
    .returning();


  const wh = created[0];

  await fireWebhookEvent({
    userId: user.id,
    event: 'api_key.created', // Placeholder if needed
    payload: { webhook_id: wh.id, endpoint_url, events, user_id: user.id },
  });

  return apiSuccess({ ...wh, secret }, {});
}, undefined);


function maskSecret(secret: string | null): string {
  if (!secret) return '****';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

async function hashSecret(secret: string): Promise<string> {
  return createHash('sha256').update(secret).digest('hex');
}

