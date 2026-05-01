import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { webhookDeliveries } from "@/lib/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { processQueue } from "@/lib/webhooks/executor";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processQueue(50);
    
    return NextResponse.json({ 
      success: true, 
      ...result,
      timestamp: new Date().toISOString() 
    });
  } catch (error: unknown) {
    console.error("Cron retry-webhooks failed:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
