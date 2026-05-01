import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customQrTypes, typeTemplates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';

export const PATCH = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);

  const { params } = req;
  const { slug, templateSlug } = params as { slug: string; templateSlug: string };
  if (!slug || !templateSlug) return apiError('VALIDATION_ERROR', 'Slug and templateSlug required.', 400);

  const body = await req.json();
  const { name, template_html, is_default } = body;

  const typeRecords = await db.select({ id: customQrTypes.id, userId: customQrTypes.userId }).from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  const typeRecord = typeRecords[0];
  if (!typeRecord) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);
  if (typeRecord.userId !== user.id) return apiError('FORBIDDEN', 'Not authorized.', 403);

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (template_html !== undefined) updates.templateHtml = template_html;
  if (is_default !== undefined) updates.isDefault = is_default;

  if (Object.keys(updates).length === 0) return apiError('VALIDATION_ERROR', 'No fields to update.', 400);

  const updated = await db
    .update(typeTemplates)
    .set(updates)
    .where(
      and(
        eq(typeTemplates.typeId, typeRecord.id),
        eq(typeTemplates.slug, templateSlug)
      )
    )
    .returning();

  if (!updated[0]) return apiError('UNKNOWN_ERROR', 'Template not found.', 404);
  return apiSuccess(updated[0]);
});

export const DELETE = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);

  const { params } = req;
  const { slug, templateSlug } = params as { slug: string; templateSlug: string };
  if (!slug || !templateSlug) return apiError('VALIDATION_ERROR', 'Slug and templateSlug required.', 400);

  const typeRecords = await db.select({ id: customQrTypes.id, userId: customQrTypes.userId }).from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  const typeRecord = typeRecords[0];
  if (!typeRecord) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);
  if (typeRecord.userId !== user.id) return apiError('FORBIDDEN', 'Not authorized.', 403);

  await db.delete(typeTemplates).where(and(eq(typeTemplates.typeId, typeRecord.id), eq(typeTemplates.slug, templateSlug)));
  return new NextResponse(null, { status: 204 });
}, undefined);
