import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { randomBytes } from 'node:crypto';
import { createHash } from 'node:crypto';

export const POST = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.WEBHOOKS_MANAGE)) return apiError('INSUFFICIENT_SCOPE', 'Missing webhooks:manage scope.', 403);
  const { params } = req;
  const id = params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'Webhook ID required.', 400);

  const webhookRecords = await db.select({ userId: webhooks.userId }).from(webhooks).where(eq(webhooks.id, id)).limit(1);
  const wh = webhookRecords[0];
  if (!wh || wh.userId !== user.id) return apiError('WEBHOOK_NOT_FOUND', 'Webhook not found.', 403);

  const newSecret = randomBytes(32).toString('hex');

  await db
    .update(webhooks)
    .set({ secret: newSecret })
    .where(eq(webhooks.id, id));

  return apiSuccess({ secret: newSecret });
}, undefined);
