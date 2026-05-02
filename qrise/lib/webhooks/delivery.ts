import { db } from '@/lib/db';
import { webhooks, webhookDeliveries } from '@/lib/db/schema';
import { eq, and, lte, or } from 'drizzle-orm';
import { WebhookEventType } from './events';

/**
 * Fire an event to all matching webhook subscriptions for a user
 */
export async function fireWebhookEvent(opts: {
  userId: string;
  event: WebhookEventType;
  payload: Record<string, unknown>;
}): Promise<void> {
  const { userId, event, payload } = opts;

  // Find all active webhooks for this user
  const webhookRecords = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.userId, userId),
        eq(webhooks.isActive, true)
      )
    );

  const matchingWebhooks = webhookRecords.filter(w => {
    // Check if webhook is subscribed to this event
    if (!w.events || !w.events.includes(event)) return false;

    // Check filter_config if present
    if (w.filterConfig) {
      const config = w.filterConfig as Record<string, {
        qr_ids?: string[];
        url_changed_only?: boolean;
        form_ids?: string[];
        min_pct?: number;
      }>;
      const eventFilter = config[event];
      
      if (eventFilter) {
        // qr.scanned -> check qr_ids
        if (event === 'qr.scanned' && eventFilter.qr_ids) {
          if (!eventFilter.qr_ids.includes(payload.qr_id as string)) {
            return false;
          }
        }
        
        // qr.updated -> check url_changed_only
        if (event === 'qr.updated' && eventFilter.url_changed_only) {
          // If the prompt says payload.url_changed, we check that.
          // In our events.ts, it was changed_fields: string[]
          // We'll check both for robustness.
          const urlChanged = payload.url_changed === true || 
            (Array.isArray(payload.changed_fields) && payload.changed_fields.includes('target_url'));
          if (!urlChanged) return false;
        }

        // form.submission -> check form_ids
        if (event === 'form.submission' && eventFilter.form_ids) {
          if (!eventFilter.form_ids.includes(payload.form_id as string)) {
            return false;
          }
        }

        // usage.threshold_reached -> check min_pct
        if (event === 'usage.threshold_reached' && eventFilter.min_pct) {
          if ((payload.percentage as number) < (eventFilter.min_pct as number)) {
            return false;
          }
        }
      }
    }

    return true;
  });

  // Create delivery records (queued)
  const now = new Date();
  const deliveries = matchingWebhooks.map(wh => ({
    webhookId: wh.id,
    eventType: event,
    payload,
    status: 'pending' as const,
    nextRetryAt: now,
    attempts: 0,
  }));

  if (deliveries.length > 0) {
    await db.insert(webhookDeliveries).values(deliveries);
  }
}

/**
 * Get pending deliveries that are ready for processing
 */
export async function getPendingDeliveries(limit: number = 50) {
  const now = new Date();
  return await db
    .select()
    .from(webhookDeliveries)
    .where(
      and(
        or(eq(webhookDeliveries.status, 'pending'), eq(webhookDeliveries.status, 'retrying')),
        lte(webhookDeliveries.nextRetryAt, now)
      )
    )
    .limit(limit);
}

