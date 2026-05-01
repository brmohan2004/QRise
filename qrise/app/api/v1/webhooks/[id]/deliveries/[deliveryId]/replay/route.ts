import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks, webhookDeliveries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { createHmac } from 'node:crypto';

export const POST = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.WEBHOOKS_MANAGE)) return apiError('INSUFFICIENT_SCOPE', 'Missing webhooks:manage scope.', 403);

  const { params } = req;
  const { id: webhookId, deliveryId } = params as { id: string; deliveryId: string };
  if (!webhookId || !deliveryId) return apiError('VALIDATION_ERROR', 'Webhook ID and Delivery ID required.', 400);

  // Verify webhook ownership
  const webhookRecords = await db.select({ userId: webhooks.userId }).from(webhooks).where(eq(webhooks.id, webhookId)).limit(1);
  const wh = webhookRecords[0];
  if (!wh || wh.userId !== user.id) return apiError('WEBHOOK_NOT_FOUND', 'Webhook not found.', 403);

  // Fetch original delivery
  const originalDeliveries = await db
    .select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.id, deliveryId))
    .limit(1);
  const original = originalDeliveries[0];
  if (!original) return apiError('UNKNOWN_ERROR', 'Original delivery not found.', 404);

  // Create new delivery as a retry
  const newDelivery = await db
    .insert(webhookDeliveries)
    .values({
      webhookId,
      eventType: original.eventType,
      payload: original.payload,
      status: 'pending' as const,
      nextRetryAt: new Date(),
      attempts: 0,
      filterConfig: original.filterConfig,
    })
    .returning();

  return apiSuccess({ new_delivery_id: newDelivery[0].id, status: 'pending' });
}, undefined);
