import { NextResponse } from 'next/server';

import { customQrTypes, qrCodes, users } from '@/lib/db/schema';
import { eq, sql, and, or, count, desc } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { getPlanRateLimits } from '@/lib/api/rate-limit-config';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';

const BUILTIN_TYPES = [
  {
    id: 'builtin-url',
    slug: 'url',
    name: 'URL',
    description: 'Simple URL redirect QR code',
    iconUrl: null,
    isPublic: true,
    isVerified: true,
    scanCount: 0,
    qrCount: 0,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '00000000-0000-0000-0000-000000000000',
  },
  {
    id: 'builtin-smart_routing',
    slug: 'smart_routing',
    name: 'Smart Routing',
    description: 'Route scans based on device, time, or location',
    iconUrl: null,
    isPublic: true,
    isVerified: true,
    scanCount: 0,
    qrCount: 0,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '00000000-0000-0000-0000-000000000000',
  },
  {
    id: 'builtin-password',
    slug: 'password',
    name: 'Password',
    description: 'Password-protected QR code',
    iconUrl: null,
    isPublic: true,
    isVerified: true,
    scanCount: 0,
    qrCount: 0,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '00000000-0000-0000-0000-000000000000',
  },
  {
    id: 'builtin-multi_action',
    slug: 'multi_action',
    name: 'Multi-Action',
    description: 'Multiple actions from one QR',
    iconUrl: null,
    isPublic: true,
    isVerified: true,
    scanCount: 0,
    qrCount: 0,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '00000000-0000-0000-0000-000000000000',
  },
  {
    id: 'builtin-bulk',
    slug: 'bulk',
    name: 'Bulk',
    description: 'Bulk QR code generation',
    iconUrl: null,
    isPublic: true,
    isVerified: true,
    scanCount: 0,
    qrCount: 0,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '00000000-0000-0000-0000-000000000000',
  },
] as const;

export const GET = withApiAuth(async (req, ctx) => {
  const { user } = ctx;
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get('scope') || 'mine') as 'mine' | 'public' | 'marketplace';

  // Build where conditions
  const conditions: any[] = [];
  if (scope === 'mine') {
    conditions.push(eq(customQrTypes.userId, user.id));
  } else if (scope === 'public') {
    conditions.push(eq(customQrTypes.isPublic, true));
  } else if (scope === 'marketplace') {
    conditions.push(eq(customQrTypes.isPublic, true), eq(customQrTypes.isVerified, true));
  }

  // Fetch custom types with QR count
  const customTypes = await ctx.db
    .select({
      id: customQrTypes.id,
      slug: customQrTypes.slug,
      name: customQrTypes.name,
      description: customQrTypes.description,
      iconUrl: customQrTypes.iconUrl,
      isPublic: customQrTypes.isPublic,
      isVerified: customQrTypes.isVerified,
      scanCount: customQrTypes.scanCount,
      version: customQrTypes.version,
      createdAt: customQrTypes.createdAt,
      updatedAt: customQrTypes.updatedAt,
      qrCount: count(qrCodes.id),
    })
    .from(customQrTypes)
    .leftJoin(qrCodes, eq(customQrTypes.id, qrCodes.customTypeId))
    .where(and(...conditions))
    .groupBy(customQrTypes.id)
    .orderBy(desc(customQrTypes.createdAt));

  // Combine with built-in types
  const typesList = customTypes.map(t => ({
    ...t,
    qr_count: Number(t.qrCount || 0),
    scanCount: Number(t.scanCount || 0),
  }));

  const allTypes = [...BUILTIN_TYPES, ...typesList];

  return apiSuccess({ types: allTypes });

}, SCOPES.TYPES_READ);

export const POST = withApiAuth(async (req, ctx) => {
  const { user } = ctx;
  const body = await req.json();
  const { slug, name, description, icon_url, fields_schema, is_public } = body;

  if (!slug || !name || !fields_schema) {
    return apiError('VALIDATION_ERROR', 'slug, name, and fields_schema are required.', 400);
  }

  // Validate slug format (lowercase, hyphens, max 80)
  if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 80) {
    return apiError('VALIDATION_ERROR', 'Invalid slug format.', 400);
  }

  // Check fields_schema is an object
  if (typeof fields_schema !== 'object' || fields_schema === null) {
    return apiError('VALIDATION_ERROR', 'fields_schema must be a valid JSON Schema object.', 400);
  }

  // Check plan limit
  const userRec = await ctx.db.select({ plan: users.plan }).from(users).where(eq(users.id, user.id)).limit(1);
  const planName = userRec[0]?.plan || 'free';
  const planLimits = await getPlanRateLimits(planName);
  if (planLimits.maxCustomTypes === 0) {
    return apiError('PLAN_LIMIT_EXCEEDED', 'Custom types are not available on your plan.', 403);
  }

  const existingCount = await ctx.db
    .select({ count: sql<number>`COUNT(*)` })
    .from(customQrTypes)
    .where(eq(customQrTypes.userId, user.id));
  if ((existingCount[0]?.count || 0) >= planLimits.maxCustomTypes) {
    return apiError('PLAN_LIMIT_EXCEEDED', `Max ${planLimits.maxCustomTypes} custom types allowed.`, 403);
  }

  // Check slug uniqueness
  const existing = await ctx.db.select().from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  if (existing[0]) {
    return apiError('VALIDATION_ERROR', 'Slug already taken.', 409);
  }

  const created = await ctx.db
    .insert(customQrTypes)
    .values({
      userId: user.id,
      slug,
      name,
      description,
      iconUrl: icon_url,
      fieldsSchema: fields_schema,
      isPublic: is_public || false,
    })
    .returning();

  // Fire webhook
  await fireWebhookEvent({
    userId: user.id,
    event: 'type.registered',
    payload: {
      type_slug: slug,
      type_id: created[0].id,
      user_id: user.id,
      name,
    },
  });

  return apiSuccess(created[0]);
}, { scope: SCOPES.TYPES_WRITE });

