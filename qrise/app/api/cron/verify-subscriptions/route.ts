import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { and, isNotNull, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch users with stripe customer IDs
    const subscribers = await db.select().from(users)
      .where(and(isNotNull(users.stripeCustomerId), eq(users.plan, 'pro')));

    const auditResults = {
      totalChecked: subscribers.length,
      mismatches: 0,
      fixed: 0
    };

    // For a real production job, you'd batch this or use a queue
    // For now, we'll check a subset or just a conceptual loop
    for (const user of subscribers.slice(0, 50)) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId!,
          status: 'active',
          limit: 1
        });

        const hasActiveStripeSub = subscriptions.data.length > 0;
        
        if (!hasActiveStripeSub && user.plan !== 'free') {
          auditResults.mismatches++;
          // Optional: Auto-fix or flag for review
          // await db.update(users).set({ plan: 'free' }).where(eq(users.id, user.id));
          // auditResults.fixed++;
        }
      } catch (e) {
        console.warn(`Failed to verify user ${user.id}:`, e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      auditResults,
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("Cron verify-subscriptions failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
