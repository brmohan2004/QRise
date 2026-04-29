import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Redis } from "@upstash/redis";
import { stripe } from "@/lib/stripe";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const start = Date.now();
    const status: any = {
      database: "unknown",
      redis: "unknown",
      stripe: "unknown",
      latency: 0
    };

    // 1. Check Database
    try {
      await db.execute(require('drizzle-orm').sql`SELECT 1`);
      status.database = "healthy";
    } catch (e) {
      status.database = "down";
    }

    // 2. Check Redis
    try {
      await redis.ping();
      status.redis = "healthy";
    } catch (e) {
      status.redis = "down";
    }

    // 3. Check Stripe
    try {
      await stripe.balance.retrieve();
      status.stripe = "healthy";
    } catch (e) {
      status.stripe = "down";
    }

    status.latency = Date.now() - start;

    return NextResponse.json({ 
      success: true, 
      status,
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("Cron check-system-health failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
