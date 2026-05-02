import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { webhooks, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { getPlanRateLimits, getUserRateLimits } from "@/lib/api/rate-limit-config";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await db.select()
      .from(webhooks)
      .where(eq(webhooks.userId, user.id))
      .orderBy(desc(webhooks.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Plan check
    const baseLimits = await getPlanRateLimits(user.id); // This usually takes plan name, but let's check the helper
    // Actually, getPlanRateLimits takes the plan name string.
    
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    const limits = await getPlanRateLimits(dbUser.plan);
    const userLimits = await getUserRateLimits(user.id, limits);

    if (!userLimits.maxWebhooks || userLimits.maxWebhooks <= 0) {
      return NextResponse.json({ error: "Webhooks are not included in your current plan." }, { status: 403 });
    }

    // Count existing webhooks
    const counts = await db
      .select({ val: count() })
      .from(webhooks)
      .where(eq(webhooks.userId, user.id));
    
    const webhookCount = Number(counts[0]?.val || 0);

    if (webhookCount >= userLimits.maxWebhooks) {
      return NextResponse.json({ error: `Webhook limit reached (${userLimits.maxWebhooks}). Upgrade your plan to add more.` }, { status: 403 });
    }

    const { endpointUrl, events } = await request.json();

    if (!endpointUrl || !events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!endpointUrl.startsWith("https://")) {
      return NextResponse.json({ error: "HTTPS is required for webhooks" }, { status: 400 });
    }

    try {
      const parsedUrl = new URL(endpointUrl);
      const host = parsedUrl.hostname;
      
      // Basic SSRF protection
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
        return NextResponse.json({ error: "Invalid webhook destination URL" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const { randomBytes } = await import("crypto");
    const secret = randomBytes(32).toString('hex');

    const result = await db.insert(webhooks).values({
      userId: user.id,
      endpointUrl,
      events,
      secret,
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
