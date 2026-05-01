import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';

export const GET = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.WEBHOOKS_MANAGE)) return apiError('INSUFFICIENT_SCOPE', 'Missing webhooks:manage scope.', 403);
  const params = await (req as any).params;
  const id = params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'Webhook ID required.', 400);

  const wh = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.id, id))
    .limit(1);

  if (!wh[0] || wh[0].userId !== user.id) return apiError('WEBHOOK_NOT_FOUND', 'Webhook not found.', 404);

  return apiSuccess({ ...wh[0], secret: undefined });
}, undefined);

export const PATCH = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.WEBHOOKS_MANAGE)) return apiError('INSUFFICIENT_SCOPE', 'Missing webhooks:manage scope.', 403);
  const params = await (req as any).params;
  const id = params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'Webhook ID required.', 400);

  const body = await req.json();
  const { endpoint_url, events, description, filter_config } = body;

  const existing = await db.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);
  if (!existing[0] || existing[0].userId !== user.id) return apiError('WEBHOOK_NOT_FOUND', 'Webhook not found.', 403);

  const updates: Record<string, unknown> = {};
  if (endpoint_url !== undefined) updates.endpointUrl = endpoint_url;
  if (events !== undefined) updates.events = events;
  if (description !== undefined) updates.description = description;
  if (filter_config !== undefined) updates.filterConfig = filter_config;

  if (Object.keys(updates).length === 0) return apiError('VALIDATION_ERROR', 'No fields to update.', 400);

  const updated = await db
    .update(webhooks)
    .set(updates)
    .where(eq(webhooks.id, id))
    .returning();

  return apiSuccess(updated[0]);
}, undefined);

export const DELETE = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.WEBHOOKS_MANAGE)) return apiError('INSUFFICIENT_SCOPE', 'Missing webhooks:manage scope.', 403);
  const params = await (req as any).params;
  const id = params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'Webhook ID required.', 400);

  const existing = await db.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);
  if (!existing[0] || existing[0].userId !== user.id) return apiError('WEBHOOK_NOT_FOUND', 'Webhook not found.', 403);

  await db.delete(webhooks).where(eq(webhooks.id, id));
  
  return new NextResponse(null, { status: 204 });
}, undefined);

