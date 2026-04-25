import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { scanEvents } from "@/lib/db/schema";
import { eq, between, and, sql, gte, lt, asc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";
    const type = searchParams.get("type") || "overview";
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ownership check
    const { data: qr, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (qrError || !qr) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    if (qr.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Calculate date range
    const now = new Date();
    let days: number;
    if (range === "90d") days = 90;
    else if (range === "30d") days = 30;
    else days = 7;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Fetch real scan events from database
    const events = await db.select()
      .from(scanEvents)
      .where(
        and(
          eq(scanEvents.qrId, id),
          between(scanEvents.scannedAt, startDate, now)
        )
      );

    if (type === "overview") {
      // Aggregate by date
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

      // Fill in missing dates with zeros
      const trend = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trend.push({
          date: dateKey,
          scans: trendMap[dateKey]?.scans || 0,
          unique: trendMap[dateKey]?.unique || 0,
        });
      }

      return NextResponse.json({ trend });
    }

    if (type === "location") {
      const locationMap: Record<string, number> = {};
      events.forEach(evt => {
        const country = evt.country || 'unknown';
        locationMap[country] = (locationMap[country] || 0) + 1;
      });
      const location = Object.entries(locationMap).map(([country, count]) => ({
        country,
        code: country.substring(0, 2).toUpperCase(), // Simplified
        count,
      }));
      return NextResponse.json(location);
    }

    if (type === "device") {
      const deviceMap: Record<string, number> = {};
      const osMap: Record<string, number> = {};
      const browserMap: Record<string, number> = {};

      events.forEach(evt => {
        if (evt.deviceType) deviceMap[evt.deviceType] = (deviceMap[evt.deviceType] || 0) + 1;
        if (evt.os) osMap[evt.os] = (osMap[evt.os] || 0) + 1;
        if (evt.browser) browserMap[evt.browser] = (browserMap[evt.browser] || 0) + 1;
      });

      return NextResponse.json({
        deviceType: Object.entries(deviceMap).map(([name, value]) => ({ name, value })),
        os: Object.entries(osMap).map(([name, value]) => ({ name, value })),
        browser: Object.entries(browserMap).map(([name, value]) => ({ name, value })),
      });
    }

    if (type === "time") {
      const heatmap = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const count = events.filter(evt => {
            if (!evt.scannedAt) return false;
            const d = new Date(evt.scannedAt);
            return d.getDay() === day && d.getHours() === hour;
          }).length;
          heatmap.push({ day, hour, count });
        }
      }
      return NextResponse.json(heatmap);
    }

    if (type === "raw") {
      const raw = events.map(evt => ({
        id: evt.id,
        scannedAt: evt.scannedAt,
        countryCode: evt.country || '--',
        deviceType: evt.deviceType || 'unknown',
        os: evt.os || 'unknown',
        browser: evt.browser || 'unknown',
        isUnique: evt.isUnique,
        isBot: evt.isBot,
      }));
      return NextResponse.json(raw);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("QR Analytics API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
