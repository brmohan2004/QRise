import { db } from '@/lib/db';
import { webhookDeliveries, webhooks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signPayload } from './signature';
import { fireWebhookEvent, getPendingDeliveries } from './delivery';

export const RETRY_SCHEDULE_MINUTES = [1, 5, 30, 120, 360, 1440] as const;

export type DeliveryResult = {
  success: boolean;
  statusCode?: number;
  responseBody?: string;
  latencyMs?: number;
  error?: string;
};

/**
 * Deliver a single webhook_deliveries record
 */
export async function executeDelivery(deliveryId: string): Promise<DeliveryResult> {
  const records = await db
    .select({
      delivery: webhookDeliveries,
      webhook: webhooks,
    })
    .from(webhookDeliveries)
    .innerJoin(webhooks, eq(webhookDeliveries.webhookId, webhooks.id))
    .where(eq(webhookDeliveries.id, deliveryId))
    .limit(1);

  if (!records[0]) {
    return { success: false, error: 'Delivery not found' };
  }

  const { delivery: d, webhook: wh } = records[0];

  const body = JSON.stringify(d.payload);
  const timestamp = Date.now();

  try {
    const signature = await signPayload({
      secret: wh.secret || '', // Use the signing secret
      timestamp,
      body,
    });

    const controller = new AbortController();
    const timeoutMs = 5000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(wh.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-QRise-Signature': signature,
        'X-QRise-Event': d.eventType || '',
        'User-Agent': 'QRise-Webhook/1.0',
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await res.text();
    const latencyMs = Date.now() - timestamp;

    if (res.ok) {
      await db
        .update(webhookDeliveries)
        .set({
          status: 'delivered' as const,
          responseStatus: String(res.status),
          deliveredAt: new Date(),
          durationMs: latencyMs,
        })
        .where(eq(webhookDeliveries.id, deliveryId));
      return { success: true, statusCode: res.status, responseBody: text, latencyMs };
    } else {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    const attempts = (d.attempts as number) + 1;

    if (attempts >= RETRY_SCHEDULE_MINUTES.length) {
      // Abandon after final attempt
      await db
        .update(webhookDeliveries)
        .set({
          status: 'abandoned' as const,
          attempts,
        })
        .where(eq(webhookDeliveries.id, deliveryId));

      // Fire notification for failure
      await fireWebhookEvent({
        userId: wh.userId,
        event: 'resolver.failed',
        payload: {
          resolver_id: wh.id,
          type: 'webhook',
          error: errorMsg,
          endpoint: wh.endpointUrl,
        },
      });

      return { success: false, error: errorMsg };
    } else {
      const retryDelay = RETRY_SCHEDULE_MINUTES[attempts - 1] * 60 * 1000;
      const nextRetry = new Date(Date.now() + retryDelay);
      await db
        .update(webhookDeliveries)
        .set({
          status: 'retrying' as const,
          attempts,
          nextRetryAt: nextRetry,
        })
        .where(eq(webhookDeliveries.id, deliveryId));

      return { success: false, error: errorMsg };
    }
  }
}

/**
 * Process a batch of pending webhook deliveries
 */
export async function processQueue(limit: number = 50) {
  const pending = await getPendingDeliveries(limit);
  
  if (pending.length === 0) return { processed: 0 };

  const results = await Promise.allSettled(
    pending.map(d => executeDelivery(d.id))
  );

  const successful = results.filter(r => r.status === 'fulfilled' && (r.value as DeliveryResult).success).length;
  const failed = results.length - successful;

  return {
    processed: results.length,
    successful,
    failed,
  };
}
