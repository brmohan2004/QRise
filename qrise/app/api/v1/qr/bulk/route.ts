import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { qrCodes, customQrTypes } from '@/lib/db/schema';
import { generateShortCode } from '@/lib/short-code';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';
import bcrypt from 'bcryptjs';

export const POST = withApiAuth(async (req, ctx) => {
  const { user, hasScope, db } = ctx;
  
  if (!hasScope(SCOPES.QR_WRITE)) {
    return apiError('INSUFFICIENT_SCOPE', 'Missing qr:write scope.', 403);
  }

  const body = await req.json();
  const { items } = body;

  if (!items || !Array.isArray(items)) {
    return apiError('VALIDATION_ERROR', 'items array is required.', 400);
  }

  if (items.length > 50) {
    return apiError('VALIDATION_ERROR', 'Bulk creation is limited to 50 items per request.', 400);
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const {
      name,
      type,
      is_dynamic = true,
      target_url,
      password,
      custom_type_slug,
      custom_type_payload,
      design,
      tags = [],
    } = item;

    if (!name || !type) {
      errors.push({ index: i, error: 'name and type are required' });
      continue;
    }

    try {
      let customTypeId: string | undefined;
      if (type === 'custom' && custom_type_slug) {
        const customType = await db
          .select()
          .from(customQrTypes)
          .where(eq(customQrTypes.slug, custom_type_slug))
          .limit(1);
        customTypeId = customType[0]?.id;
      }

      const shortCode = await generateShortCode();
      const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

      const created = await db
        .insert(qrCodes)
        .values({
          userId: user.id,
          name,
          type,
          shortCode,
          targetUrl: target_url,
          isDynamic: is_dynamic,
          passwordHash,
          designConfig: design as Record<string, unknown>,
          customTypeId,
          customTypePayload: custom_type_payload as Record<string, unknown>,
          tags: tags.length > 0 ? tags : undefined,
        })
        .returning();

      const newQr = created[0];
      const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${shortCode}`;

      results.push({
        id: newQr.id,
        name: newQr.name,
        short_url: shortUrl,
        short_code: shortCode
      });

      // Fire webhook for each (async)
      fireWebhookEvent({
        userId: user.id,
        event: 'qr.created',
        payload: {
          qr_id: newQr.id,
          name,
          type,
          short_url: shortUrl,
          user_id: user.id,
          bulk_batch: true
        },
      }).catch(console.error);

    } catch (err) {
      errors.push({ index: i, error: err instanceof Error ? err.message : 'Internal error' });
    }
  }

  return apiSuccess({
    total: items.length,
    processed: results.length,
    failed: errors.length,
    results,
    errors: errors.length > 0 ? errors : undefined
  });
});

import { eq } from 'drizzle-orm';
