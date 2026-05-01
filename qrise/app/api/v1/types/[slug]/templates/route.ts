import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customQrTypes, typeTemplates } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';

export const GET = withApiAuth(async (req, ctx) => {
  const { hasScope } = ctx;
  if (!hasScope(SCOPES.TYPES_READ)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:read scope.', 403);
  const params = await (req as any).params;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const typeRecord = await db.select({ id: customQrTypes.id }).from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  if (!typeRecord[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);

  const templates = await db
    .select()
    .from(typeTemplates)
    .where(eq(typeTemplates.typeId, typeRecord[0].id))
    .orderBy(desc(typeTemplates.createdAt));

  return apiSuccess({ templates });
});

export const POST = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);
  const params = await (req as any).params;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const body = await req.json();
  const { slug: templateSlug, name, template_html, is_default } = body;
  if (!templateSlug || !name || !template_html) {
    return apiError('VALIDATION_ERROR', 'slug, name, and template_html are required.', 400);
  }

  const typeRecord = await db.select().from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  if (!typeRecord[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);
  if (typeRecord[0].userId !== user.id) return apiError('FORBIDDEN', 'Not authorized.', 403);

  const existingCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(typeTemplates)
    .where(eq(typeTemplates.typeId, typeRecord[0].id));
  if (Number(existingCount[0]?.count || 0) >= 10) {
    return apiError('PLAN_LIMIT_EXCEEDED', 'Max 10 templates per type.', 403);
  }

  const tpl = await db
    .insert(typeTemplates)
    .values({
      typeId: typeRecord[0].id,
      slug: templateSlug,
      name,
      templateHtml: template_html,
      isDefault: is_default || false,
    })
    .returning();

   return apiSuccess(tpl[0]);
}, undefined);

