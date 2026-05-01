import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { webhookDeliveries } from '@/lib/db/schema';
import { and, lte, or, eq } from 'drizzle-orm';
import { executeDelivery } from '@/lib/webhooks/executor';

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  
  if (!secret || !auth || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  
  try {
    // Queries pending/retrying deliveries where next_retry_at <= NOW()
    const scheduledDeliveries = await db
      .select()
      .from(webhookDeliveries)
      .where(
        and(
          or(
            eq(webhookDeliveries.status, 'pending'),
            eq(webhookDeliveries.status, 'retrying')
          ),
          lte(webhookDeliveries.nextRetryAt, now)
        )
      )
      .limit(50);

    let processed = 0;
    let failed = 0;

    // Process in parallel with a small limit if needed, or sequential for simplicity here
    for (const delivery of scheduledDeliveries) {
      try {
        await executeDelivery(delivery.id);
        processed++;
      } catch (err) {
        failed++;
        console.error(`[WebhookProcessor] Delivery ${delivery.id} failed:`, err);
      }
    }

    return NextResponse.json({ 
      processed, 
      failed, 
      timestamp: now.toISOString() 
    });
  } catch (error) {
    console.error('[WebhookProcessor] Critical error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
