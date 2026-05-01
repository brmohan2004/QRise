import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customQrTypes, qrCodes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';

export const GET = withApiAuth(async (req, ctx) => {
  const { hasScope } = ctx;
  if (!hasScope(SCOPES.TYPES_READ)) {
    return apiError('INSUFFICIENT_SCOPE', 'Missing types:read scope.', 403);
  }

  const params = await (req as any).params;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const type = await db
    .select()
    .from(customQrTypes)
    .where(eq(customQrTypes.slug, slug))
    .limit(1);

  if (!type[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);

  return apiSuccess(type[0]);
});

export const PATCH = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) {
    return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);
  }

  const params = await (req as any).params;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const body = await req.json();
  const { name, description, fields_schema, is_public } = body;

  const existing = await db
    .select()
    .from(customQrTypes)
    .where(eq(customQrTypes.slug, slug))
    .limit(1);
  if (!existing[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);
  const typeRecord = existing[0];

  if (typeRecord.userId !== user.id) {
    return apiError('FORBIDDEN', 'Not authorized to edit this type.', 403);
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (fields_schema !== undefined) {
    updates.fieldsSchema = fields_schema;
    updates.version = (typeRecord.version || 0) + 1;
  }
  if (is_public !== undefined) updates.isPublic = is_public;

  if (Object.keys(updates).length === 0) {
    return apiError('VALIDATION_ERROR', 'No fields to update.', 400);
  }

  updates.updatedAt = new Date();

  const updated = await db
    .update(customQrTypes)
    .set(updates)
    .where(eq(customQrTypes.slug, slug))
    .returning();

  await fireWebhookEvent({
    userId: user.id,
    event: 'type.updated',
    payload: { type_slug: slug, type_id: updated[0].id, user_id: user.id, changes: Object.keys(updates) },
  });

  return apiSuccess(updated[0]);
});

export const DELETE = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) {
    return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);
  }

  const params = await (req as any).params;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const existing = await db
    .select()
    .from(customQrTypes)
    .where(eq(customQrTypes.slug, slug))
    .limit(1);
  if (!existing[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);
  if (existing[0].userId !== user.id) {
    return apiError('FORBIDDEN', 'Not authorized.', 403);
  }

  // Check active QRs using this type
  const qrCountResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(qrCodes)
    .where(eq(qrCodes.customTypeId, existing[0].id));
    
  if (Number(qrCountResult[0]?.count || 0) > 0) {
    return apiError('TYPE_IN_USE', 'Cannot delete type while QRs are using it.', 409);
  }

   await db.delete(customQrTypes).where(eq(customQrTypes.slug, slug));

   return new NextResponse(null, { status: 204 });
}, undefined);

