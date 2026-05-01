import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customQrTypes, typeMarketplaceSubmissions } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';

export const POST = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);

  const params = await (req as any).params;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const typeRecord = await db
    .select({
      id: customQrTypes.id,
      userId: customQrTypes.userId,
      isPublic: customQrTypes.isPublic,
      description: customQrTypes.description,
      iconUrl: customQrTypes.iconUrl,
    })
    .from(customQrTypes)
    .where(eq(customQrTypes.slug, slug))
    .limit(1);
  if (!typeRecord[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);
  if (typeRecord[0].userId !== user.id) return apiError('FORBIDDEN', 'Not authorized.', 403);

  // Pre-flight checklist
  if (!typeRecord[0].isPublic) return apiError('VALIDATION_ERROR', 'Type must be public to submit.', 400);
  if (!typeRecord[0].description) return apiError('VALIDATION_ERROR', 'Type must have a description.', 400);
  if (!typeRecord[0].iconUrl) return apiError('VALIDATION_ERROR', 'Type must have an icon.', 400);

  // Check existing pending submissions count (max 3)
  const pendingCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(typeMarketplaceSubmissions)
    .where(
      and(
        eq(typeMarketplaceSubmissions.userId, user.id),
        eq(typeMarketplaceSubmissions.status, 'pending')
      )
    );
  if (Number(pendingCount[0]?.count || 0) >= 3) {
    return apiError('VALIDATION_ERROR', 'Max 3 pending submissions at a time.', 400);
  }

  const sub = await db
    .insert(typeMarketplaceSubmissions)
    .values({
      typeId: typeRecord[0].id,
      userId: user.id,
      notes: (await req.json()).notes || '',
    })
    .returning();

  return apiSuccess({
    submission_id: sub[0].id,
    status: 'pending',
    estimated_review_days: 3,
  });
}, undefined);

