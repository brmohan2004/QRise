import { NextRequest, NextResponse } from "next/server";
import { fireWebhookEvent } from "@/lib/webhooks/delivery";
import { WebhookEventType } from "@/lib/webhooks/events";

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

    await fireWebhookEvent({
      userId,
      event: event as WebhookEventType,
      payload
    });

    return NextResponse.json({ success: true, queued: true });
  } catch (error: any) {
    console.error("Webhook dispatcher error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
