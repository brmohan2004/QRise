import { NextResponse } from 'next/server';

import { qrCodes, customQrTypes } from '@/lib/db/schema';
import { eq, desc, or, ilike, sql, and } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';
import { generateShortCode } from '@/lib/short-code';
import bcrypt from 'bcryptjs';
import { type SQL } from 'drizzle-orm';

export const GET = withApiAuth(async (req, ctx) => {
  const { user, hasScope, environment } = ctx;
  if (!hasScope(SCOPES.QR_READ)) {
    return apiError('INSUFFICIENT_SCOPE', 'Missing qr:read scope.', 403);
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const tags = searchParams.getAll('tags');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [eq(qrCodes.userId, user.id), eq(qrCodes.isDeleted, false)];

  if (type) conditions.push(eq(qrCodes.type, type));
  if (status) conditions.push(eq(qrCodes.status, status as 'active' | 'suspended' | 'deleted'));
  if (tags.length > 0) {
    conditions.push(sql`${qrCodes.tags} && ${tags}::text[]`);
  }
  if (search) conditions.push(ilike(qrCodes.name, `%${search}%`));

  const qrs = await ctx.db
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
      tags: qrCodes.tags,
    })
    .from(qrCodes)
    .where(and(...conditions))
    .orderBy(desc(qrCodes.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await ctx.db
    .select({ count: sql<number>`count(*)` })
    .from(qrCodes)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);

  return apiSuccess(
    { qrs },
    { page, limit, total }
  );
});

export const POST = withApiAuth(async (req, ctx) => {
  const { user, hasScope } = ctx;
  if (!hasScope(SCOPES.QR_WRITE)) {
    return apiError('INSUFFICIENT_SCOPE', 'Missing qr:write scope.', 403);
  }

  const body = await req.json();
  const {
    name,
    type,
    is_dynamic = true,
    target_url,
    password,
    routing_rules,
    actions,
    custom_type_slug,
    custom_type_payload,
    design,
    tags = [],
  } = body;

  if (!name || !type) {
    return apiError('VALIDATION_ERROR', 'name and type are required.', 400);
  }

  // Validate custom type if provided
  let customTypeId: string | undefined;
  if (type === 'custom' && custom_type_slug) {
    const customType = await ctx.db
      .select()
      .from(customQrTypes)
      .where(eq(customQrTypes.slug, custom_type_slug))
      .limit(1);
    if (!customType[0]) {
      return apiError('NOT_FOUND', 'Custom type not found.', 404);
    }
    customTypeId = customType[0].id;
  }

  // Generate short code
  const shortCode = await generateUniqueShortCode();

  const created = await ctx.db
    .insert(qrCodes)
    .values({
      userId: user.id,
      name,
      type,
      shortCode,
      targetUrl: target_url,
      isDynamic: is_dynamic,
      passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
      designConfig: design as Record<string, unknown>,
      customTypeId,
      customTypePayload: custom_type_payload as Record<string, unknown>,
      tags: tags.length > 0 ? tags : undefined,
    })
    .returning();

  const newQr = created[0];

  // Fire webhook
  await fireWebhookEvent({
    userId: user.id,
    event: 'qr.created',
    payload: {
      qr_id: newQr.id,
      name,
      type,
      short_url: `${process.env.NEXT_PUBLIC_APP_URL}/${shortCode}`,
      user_id: user.id,
    },
  });

  return apiSuccess({
    ...newQr,
    short_url: `${process.env.NEXT_PUBLIC_APP_URL}/${shortCode}`,
  }, {});
}, undefined);

async function generateUniqueShortCode(): Promise<string> {
  return generateShortCode();
}


