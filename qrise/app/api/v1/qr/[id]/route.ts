import { NextResponse } from 'next/server';

import { qrCodes, qrRedirectHistory } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';
import { SCOPES } from '@/lib/api/scope-registry';

export const GET = withApiAuth(async (req, ctx) => {
  const id = ctx.params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'QR ID required.', 400);

  const qr = await ctx.db
    .select({
      id: qrCodes.id,
      name: qrCodes.name,
      type: qrCodes.type,
      shortCode: qrCodes.shortCode,
      targetUrl: qrCodes.targetUrl,
      isDynamic: qrCodes.isDynamic,
      status: qrCodes.status,
      scanCount: qrCodes.scanCount,
      createdAt: qrCodes.createdAt,
      designConfig: qrCodes.designConfig,
      customTypeId: qrCodes.customTypeId,
      customTypePayload: qrCodes.customTypePayload,
      tags: qrCodes.tags,
    })
    .from(qrCodes)
    .where(eq(qrCodes.id, id))
    .limit(1);

  if (!qr[0]) {
    return apiError('NOT_FOUND', 'QR code not found.', 404);
  }

  const qrData = qr[0];
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${qrData.shortCode}`;

  return apiSuccess({
    ...qrData,
    short_url: shortUrl,
    embed_snippet: `<iframe src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${qrData.shortCode}" width="300" height="400" frameborder="0"></iframe>`,
  });
});

export const PATCH = withApiAuth(async (req, ctx) => {
  const id = ctx.params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'QR ID required.', 400);

  const { hasScope } = ctx;
  if (!hasScope(SCOPES.QR_WRITE)) {
    return apiError('INSUFFICIENT_SCOPE', 'Missing qr:write scope.', 403);
  }

  const body = await req.json();
  const { target_url, name, tags, design } = body;

  const updates: Record<string, unknown> = {};
  if (target_url !== undefined) {
    updates.targetUrl = target_url;
    // Log redirect history
    const existing = await ctx.db.select().from(qrCodes).where(eq(qrCodes.id, id)).limit(1);
    if (existing[0] && existing[0].targetUrl !== target_url) {
      await ctx.db.insert(qrRedirectHistory).values({
        qrId: id,
        oldUrl: existing[0].targetUrl,
        newUrl: target_url,
        changedBy: ctx.user.id,
      });
    }
  }
  if (name !== undefined) updates.name = name;
  if (tags !== undefined) updates.tags = tags;
  if (design !== undefined) updates.designConfig = design;

  if (Object.keys(updates).length === 0) {
    return apiError('VALIDATION_ERROR', 'No fields to update.', 400);
  }

  updates.updatedAt = new Date();

  const updated = await ctx.db
    .update(qrCodes)
    .set(updates)
    .where(eq(qrCodes.id, id))
    .returning();

  if (updated[0]) {
    await fireWebhookEvent({
      userId: ctx.user.id,
      event: 'qr.updated',
      payload: { qr_id: id, name: updated[0].name, changed_fields: Object.keys(updates), user_id: ctx.user.id },
    });
  }

  return apiSuccess(updated[0]);
});

export const DELETE = withApiAuth(async (req, ctx) => {
  const id = ctx.params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'QR ID required.', 400);

  const { hasScope } = ctx;
  if (!hasScope(SCOPES.QR_WRITE)) {
    return apiError('INSUFFICIENT_SCOPE', 'Missing qr:write scope.', 403);
  }

  // Soft delete
  await ctx.db
    .update(qrCodes)
    .set({ isDeleted: true, deletedAt: new Date(), status: 'deleted' as const })
    .where(eq(qrCodes.id, id));

  await fireWebhookEvent({
    userId: ctx.user.id,
    event: 'qr.deleted',
    payload: { qr_id: id, user_id: ctx.user.id },
  });

    return new NextResponse(null, { status: 204 });
}, undefined);

