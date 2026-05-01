import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customQrTypes, typeResolvers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { createHmac } from 'node:crypto';

export const POST = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.TYPES_WRITE)) return apiError('INSUFFICIENT_SCOPE', 'Missing types:write scope.', 403);

  const { params } = req;
  const slug = params?.slug;
  if (!slug) return apiError('VALIDATION_ERROR', 'Slug required.', 400);

  const body = await req.json();
  const scanContext = body.scan_context || {
    device_type: 'desktop',
    os: 'linux',
    country: 'US',
    language: 'en',
    timestamp: new Date().toISOString(),
    qr_payload: {},
  };

  const typeRecords = await db.select().from(customQrTypes).where(eq(customQrTypes.slug, slug)).limit(1);
  const typeRecord = typeRecords[0];
  if (!typeRecord) return apiError('TYPE_NOT_FOUND', 'Type not found.', 404);

  const resolvers = await db.select().from(typeResolvers).where(eq(typeResolvers.typeId, typeRecord.id)).limit(1);
  const resolver = resolvers[0];
  if (!resolver) return apiError('RESOLVER_NOT_CONFIGURED', 'No resolver configured.', 404);

  try {
    const ts = Math.floor(Date.now() / 1000);
    const bodyStr = JSON.stringify({ scan_context: scanContext });
    const hmac = createHmac('sha256', resolver.resolverSecret);
    hmac.update(`${ts}.${bodyStr}`);
    const signature = `t=${ts},v1=${hmac.digest('hex')}`;

    const controller = new AbortController();
    const timeoutMs = resolver.timeoutMs || 3000;
    const t = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(resolver.resolverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-QRise-Signature': signature,
        'X-QRise-Type': slug,
        'User-Agent': 'QRise-Resolver-Test/1.0',
      },
      body: bodyStr,
      signal: controller.signal,
    });

    clearTimeout(t);
    const responseBody = await res.text();

    return apiSuccess({
      status: res.status,
      latency_ms: Date.now() - ts * 1000,
      response: responseBody,
      fallback_used: false,
      signed_correctly: true,
    });
  } catch (err: any) {
    return apiSuccess({
      status: 0,
      latency_ms: 0,
      response: null,
      fallback_used: false,
      signed_correctly: false,
      error: err.message,
    });
  }
}, undefined);
