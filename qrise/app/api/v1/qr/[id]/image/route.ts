import { NextResponse } from 'next/server';
import { getQrImageStream } from '@/lib/qr-generator';
import { db } from '@/lib/db';
import { qrCodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/api/rate-limit-config';

const IMAGE_RATE_LIMIT = 60; // per minute per key

export const GET = withApiAuth(async (req, ctx) => {
  const params = await (req as any).params;
  const id = params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'QR ID required.', 400);

  // Hard image render rate limit (protects CPU)
  if (redis) {
    const identifier = `img:${ctx.apiKey.id}`;
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(IMAGE_RATE_LIMIT, '1 m'),
      prefix: 'rl:img',
    });
    const { success, reset } = await limiter.limit(identifier);
    if (!success) {
      const response = apiError('RATE_LIMITED', 'Image render limit exceeded.', 429);
      response.headers.set('Retry-After', String(Math.ceil(reset / 1000)));
      return response;
    }
  }

  const { searchParams } = new URL(req.url);
  const format = (searchParams.get('format') || 'png') as 'png' | 'svg' | 'webp';
  const size = Math.min(parseInt(searchParams.get('size') || '512'), 2048);
  const margin = Math.min(Math.max(parseInt(searchParams.get('margin') || '4'), 0), 10);
  const dark = searchParams.get('dark');
  const light = searchParams.get('light');
  const errorCorrection = (searchParams.get('error_correction') || 'M') as 'L' | 'M' | 'Q' | 'H';

   const qr = await db.select({
     shortCode: qrCodes.shortCode,
     targetUrl: qrCodes.targetUrl,
     designConfig: qrCodes.designConfig
   }).from(qrCodes).where(eq(qrCodes.id, id)).limit(1);

  if (!qr[0]) {
    return apiError('QR_NOT_FOUND', 'QR code not found.', 404);
  }

  // Generate QR image stream
  const stream = await getQrImageStream({
    content: qr[0].targetUrl || `${process.env.NEXT_PUBLIC_APP_URL}/qr/${qr[0].shortCode}`,
    format,
    size,
    margin,
    dark: dark || undefined,
    light: light || undefined,
    errorCorrection,
    designConfig: qr[0].designConfig as any,
  });

  const contentType = format === 'svg' ? 'image/svg+xml' : format === 'webp' ? 'image/webp' : 'image/png';
  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}, { scope: SCOPES.QR_READ, billableUnit: 'image_render' });

