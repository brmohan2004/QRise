import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhookDeliveries, webhooks } from '@/lib/db/schema';
import { eq, desc, sql, and, count as sqlCount } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';

export const GET = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.WEBHOOKS_MANAGE)) return apiError('INSUFFICIENT_SCOPE', 'Missing webhooks:manage scope.', 403);
  const { params } = req;
  const id = params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'Webhook ID required.', 400);

  // Verify ownership
  const webhookRecords = await db.select({ userId: webhooks.userId }).from(webhooks).where(eq(webhooks.id, id)).limit(1);
  const wh = webhookRecords[0];
  if (!wh || wh.userId !== user.id) return apiError('WEBHOOK_NOT_FOUND', 'Webhook not found.', 403);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const event = searchParams.get('event');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;

  const conditions = [eq(webhookDeliveries.webhookId, id)];
  if (status) conditions.push(eq(webhookDeliveries.status, status as any));
  if (event) conditions.push(eq(webhookDeliveries.eventType, event));

  const deliveries = await db
    .select()
    .from(webhookDeliveries)
    .where(and(...conditions))
    .orderBy(desc(webhookDeliveries.deliveredAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(webhookDeliveries)
    .where(and(...conditions));

   return apiSuccess({ deliveries }, { page, limit, total: Number(count) });
}, undefined);
