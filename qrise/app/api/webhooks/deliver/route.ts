import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { webhooks, webhookDeliveries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-internal-secret");
    if (authHeader !== process.env.INTERNAL_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event, payload, userId } = await request.json();

    if (!event || !payload || !userId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Find matching webhooks
    const activeWebhooks = await db.select().from(webhooks)
      .where(and(eq(webhooks.userId, userId), eq(webhooks.isActive, true)));

    const matchingWebhooks = activeWebhooks.filter(w => w.events.includes(event));

    // 2. Deliver to each
    const results = await Promise.all(matchingWebhooks.map(async (webhook) => {
      const body = JSON.stringify({
        event,
        payload,
        timestamp: new Date().toISOString(),
      });

      // Sign the payload if secret exists
      const hmac = crypto.createHmac("sha256", webhook.secret || "default_secret");
      const signature = hmac.update(body).digest("hex");

      try {
        const res = await fetch(webhook.endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-QRise-Signature": `sha256=${signature}`,
            "User-Agent": "QRise-Webhook-Deliverer/1.0",
          },
          body,
        });

        // Log delivery
        await db.insert(webhookDeliveries).values({
          webhookId: webhook.id,
          eventType: event,
          payload: JSON.parse(body),
          responseStatus: res.status.toString(),
          deliveredAt: new Date(),
          attempts: 1,
        });

        return { id: webhook.id, status: res.status };
      } catch (err: any) {
        console.error(`Webhook delivery failed to ${webhook.endpointUrl}:`, err);
        
        await db.insert(webhookDeliveries).values({
          webhookId: webhook.id,
          eventType: event,
          payload: JSON.parse(body),
          responseStatus: "failed",
          deliveredAt: new Date(),
          attempts: 1,
        });

        return { id: webhook.id, status: "failed" };
      }
    }));

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Webhook dispatcher error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
