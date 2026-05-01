import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';
import { createHmac } from 'node:crypto';

export const POST = withApiAuth(async (req, ctx) => {
  const { hasScope, user } = ctx;
  if (!hasScope(SCOPES.WEBHOOKS_MANAGE)) return apiError('INSUFFICIENT_SCOPE', 'Missing webhooks:manage scope.', 403);
  const { params } = req;
  const id = params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'Webhook ID required.', 400);

  const body = await req.json();
  const eventType = body.event || 'qr.created';
  const payload = buildTestPayload(eventType, user.id);

  const webhookRecords = await db.select({ endpointUrl: webhooks.endpointUrl, secret: webhooks.secret, userId: webhooks.userId }).from(webhooks).where(eq(webhooks.id, id)).limit(1);
  const wh = webhookRecords[0];
  if (!wh || wh.userId !== user.id) return apiError('WEBHOOK_NOT_FOUND', 'Webhook not found.', 403);

  try {
    const ts = Math.floor(Date.now() / 1000);
    const bodyStr = JSON.stringify(payload);
    const signature = `t=${ts},v1=${createHmac('sha256', wh.secret || "").update(`${ts}.${bodyStr}`).digest('hex')}`;

    const controller = new AbortController();
    const timeoutMs = 5000;
    const t = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(wh.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-QRise-Signature': signature,
        'X-QRise-Event': eventType,
        'User-Agent': 'QRise-Test/1.0',
      },
      body: bodyStr,
      signal: controller.signal,
    });

    clearTimeout(t);
    const responseBody = await res.text();

    return apiSuccess({
      delivered: res.ok,
      status_code: res.status,
      latency_ms: Date.now() - ts * 1000,
      response_body: responseBody,
      signature_sent: signature,
    });
  } catch (err: any) {
    return apiSuccess({
      delivered: false,
      error: err.message,
    });
  }
}, undefined);

function buildTestPayload(event: string, userId: string): Record<string, unknown> {
  return {
    id: `evt_${Date.now()}`,
    type: event,
    created_at: new Date().toISOString(),
    api_version: '2026-04-01',
    data: {
      qr_id: 'qr_test_123',
      user_id: userId,
      name: 'Test QR',
      short_url: 'https://app.qrise.app/abc123',
    },
  };
}
