import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customQrTypes, typeResolvers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { randomBytes } from 'node:crypto';

export const POST = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);

  const { params } = req;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const typeRecord = await db.select().from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  if (!typeRecord[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);
  if (typeRecord[0].userId !== user.id) return apiError('FORBIDDEN', 'Not authorized.', 403);

  const newSecret = randomBytes(32).toString('hex');
  await db.update(typeResolvers).set({ resolverSecret: newSecret, updatedAt: new Date() }).where(eq(typeResolvers.typeId, typeRecord[0].id));

  return apiSuccess({ resolver_secret: newSecret });
}, undefined);
