import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { qrCodes, scanEvents } from "@/lib/db/schema";
import { eq, and, sql, gte, desc, between } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate date range
    const now = new Date();
    let days: number;
    if (range === "90d") days = 90;
    else if (range === "30d") days = 30;
    else days = 7;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // 1. Fetch trend data
    const events = await db
      .select({
        scannedAt: scanEvents.scannedAt,
        isUnique: scanEvents.isUnique,
        country: scanEvents.country,
      })
      .from(scanEvents)
      .innerJoin(qrCodes, eq(scanEvents.qrId, qrCodes.id))
      .where(
        and(
          eq(qrCodes.userId, user.id),
          between(scanEvents.scannedAt, startDate, now)
        )
      );

    // Aggregate trend by date
    const trendMap: Record<string, { scans: number; unique: number }> = {};
    events.forEach(evt => {
      if (!evt.scannedAt) return;
      const dateKey = new Date(evt.scannedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = { scans: 0, unique: 0 };
      }
      trendMap[dateKey].scans++;
      if (evt.isUnique) trendMap[dateKey].unique++;
    });

    const trendData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendData.push({
        date: dateKey,
        scans: trendMap[dateKey]?.scans || 0,
        unique: trendMap[dateKey]?.unique || 0,
      });
    }

    // 2. Fetch location data
    const locationMap: Record<string, number> = {};
    events.forEach(evt => {
      const country = evt.country || 'Unknown';
      locationMap[country] = (locationMap[country] || 0) + 1;
    });

    const locationData = Object.entries(locationMap)
      .map(([country, count]) => ({
        country,
        code: country.length === 2 ? country : country.substring(0, 2).toUpperCase(),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      trend: trendData,
      locations: locationData,
      summary: {
        totalScans: events.length,
        totalUnique: events.filter(e => e.isUnique).length,
      }
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
