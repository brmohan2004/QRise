import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customQrTypes, typeResolvers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { randomBytes } from 'node:crypto';

export const GET = withApiAuth(async (req, ctx) => {
  const { hasScope } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);
  const params = await (req as any).params;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const typeRecord = await db.select().from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  if (!typeRecord[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);

  const resolver = await db.select().from(typeResolvers).where(eq(typeResolvers.typeId, typeRecord[0].id)).limit(1);
  if (!resolver[0]) return apiSuccess({ exists: false });

  return apiSuccess({
    exists: true,
    resolver_url: resolver[0].resolverUrl,
    timeout_ms: resolver[0].timeoutMs,
    fallback_url: resolver[0].fallbackUrl,
    fallback_html: resolver[0].fallbackHtml,
    retry_on_fail: resolver[0].retryOnFail,
    is_active: resolver[0].isActive,
    resolver_secret: maskSecret(resolver[0].resolverSecret || ''),
  });
});

export const PUT = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);
  const params = await (req as any).params;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);
  const body = await req.json();
  const { resolver_url, timeout_ms, fallback_url, fallback_html, retry_on_fail } = body;
  if (!resolver_url || !resolver_url.startsWith('https://')) {
    return apiError('VALIDATION_ERROR', 'resolver_url must be HTTPS.', 400);
  }

  try {
    const parsedUrl = new URL(resolver_url);
    const host = parsedUrl.hostname;
    
    // SSRF protection
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      /^fc00:/i.test(host) ||
      /^fd00:/i.test(host) ||
      /^fe80:/i.test(host) ||
      host.endsWith('.internal')
    ) {
      return apiError('VALIDATION_ERROR', 'Invalid resolver destination URL.', 400);
    }
  } catch {
    return apiError('VALIDATION_ERROR', 'Invalid URL format.', 400);
  }

  const typeRecord = await db.select().from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  if (!typeRecord[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);
  if (typeRecord[0].userId !== user.id) return apiError('FORBIDDEN', 'Not authorized.', 403);

  const existing = await db.select().from(typeResolvers).where(eq(typeResolvers.typeId, typeRecord[0].id)).limit(1);
  let result;
  if (existing[0]) {
    const updated = await db
      .update(typeResolvers)
      .set({
        resolverUrl: resolver_url,
        timeoutMs: timeout_ms,
        fallbackUrl: fallback_url,
        fallbackHtml: fallback_html,
        retryOnFail: retry_on_fail ?? true,
        updatedAt: new Date(),
      })
      .where(eq(typeResolvers.typeId, typeRecord[0].id))
      .returning();
    result = updated[0];
  } else {
    const secret = randomBytes(32).toString('hex');
    const created = await db
      .insert(typeResolvers)
      .values({
        typeId: typeRecord[0].id,
        resolverUrl: resolver_url,
        resolverSecret: secret,
        timeoutMs: timeout_ms,
        fallbackUrl: fallback_url,
        fallbackHtml: fallback_html,
        retryOnFail: retry_on_fail ?? true,
      })
      .returning();
    result = created[0];
  }
  return apiSuccess({ ...result, resolver_secret: existing[0] ? 'unchanged' : result.resolverSecret });
});

export const DELETE = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);
  const params = await (req as any).params;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const typeRecord = await db.select().from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  if (!typeRecord[0]) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);
  if (typeRecord[0].userId !== user.id) return apiError('FORBIDDEN', 'Not authorized.', 403);

  await db.delete(typeResolvers).where(eq(typeResolvers.typeId, typeRecord[0].id));
  return new NextResponse(null, { status: 204 });
}, undefined);


function maskSecret(secret: string): string {
  return secret.length < 8 ? '****' : `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
