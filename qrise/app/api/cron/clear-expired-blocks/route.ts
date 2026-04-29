import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ipBlocks } from "@/lib/db/schema";
import { lt, and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Use sql template literal for a more direct query if lt/and is causing issues
    const { sql } = require('drizzle-orm');
    const deleted = await db.execute(sql`
      DELETE FROM ip_blocks 
      WHERE expires_at < ${now} 
      AND is_permanent = false
      RETURNING *
    `);

    return NextResponse.json({ 
      success: true, 
      unblockedCount: Array.isArray(deleted) ? deleted.length : 0,
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("Cron clear-expired-blocks failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
