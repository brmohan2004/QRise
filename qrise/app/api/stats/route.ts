import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { qrCodes, scanEvents } from "@/lib/db/schema";
import { eq, and, sql, gte, desc } from "drizzle-orm";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Attempt to get cached stats from Redis
    const cacheKey = `stats:${user.id}`;
    const cachedStats = await redis.get(cacheKey);
    if (cachedStats) {
      // return NextResponse.json(JSON.parse(cachedStats as string));
    }

    // 1. Get totals
    const [counts] = await db
      .select({
        totalQRs: sql<number>`count(distinct ${qrCodes.id})`,
        activeQRs: sql<number>`count(distinct case when ${qrCodes.isActive} = true then ${qrCodes.id} end)`,
      })
      .from(qrCodes)
      .where(and(eq(qrCodes.userId, user.id), eq(qrCodes.isDeleted, false)));

    // 2. Get scan totals and today's scans
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [scanCounts] = await db
      .select({
        totalScans: sql<number>`count(${scanEvents.id})`,
        scansToday: sql<number>`count(case when ${scanEvents.scannedAt} >= ${today.toISOString()} then 1 end)`,
      })
      .from(scanEvents)
      .innerJoin(qrCodes, eq(scanEvents.qrId, qrCodes.id))
      .where(and(eq(qrCodes.userId, user.id), eq(qrCodes.isDeleted, false)));

    // 3. Get Top QRs
    const topQRs = await db
      .select({
        id: qrCodes.id,
        name: qrCodes.name,
        type: qrCodes.type,
        scans: sql<number>`count(${scanEvents.id})`,
      })
      .from(qrCodes)
      .leftJoin(scanEvents, eq(qrCodes.id, scanEvents.qrId))
      .where(and(eq(qrCodes.userId, user.id), eq(qrCodes.isDeleted, false)))
      .groupBy(qrCodes.id)
      .orderBy(desc(sql`count(${scanEvents.id})`))
      .limit(5);

    // 4. Get Recent Activity
    const recentActivity = await db
      .select({
        id: scanEvents.id,
        qrId: qrCodes.id,
        qrName: qrCodes.name,
        countryCode: scanEvents.country,
        deviceType: scanEvents.deviceType,
        scannedAt: scanEvents.scannedAt,
      })
      .from(scanEvents)
      .innerJoin(qrCodes, eq(scanEvents.qrId, qrCodes.id))
      .where(and(eq(qrCodes.userId, user.id), eq(qrCodes.isDeleted, false)))
      .orderBy(desc(scanEvents.scannedAt))
      .limit(5);

    // Calculate deltas (simple implementation for now, could be improved by comparing with previous period)
    const stats = {
      totalQRs: Number(counts.totalQRs) || 0,
      totalScans: Number(scanCounts.totalScans) || 0,
      activeQRs: Number(counts.activeQRs) || 0,
      scansToday: Number(scanCounts.scansToday) || 0,
      deltas: {
        totalQRs: "0",
        totalScans: "0",
        activeQRs: "0",
        scansToday: "0"
      },
      topQRs: topQRs.map(qr => ({
        ...qr,
        scans: Number(qr.scans)
      })),
      recentActivity
    };

    // Cache in Redis for 30 seconds
    await redis.set(cacheKey, JSON.stringify(stats), { ex: 30 });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
