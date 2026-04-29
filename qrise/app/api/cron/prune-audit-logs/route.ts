import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminAuditLog } from "@/lib/db/schema";
import { lt } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deleted = await db.delete(adminAuditLog)
      .where(lt(adminAuditLog.createdAt, ninetyDaysAgo))
      .returning();

    return NextResponse.json({ 
      success: true, 
      prunedCount: deleted.length,
      thresholdDate: ninetyDaysAgo.toISOString(),
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    console.error("Cron prune-audit-logs failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
