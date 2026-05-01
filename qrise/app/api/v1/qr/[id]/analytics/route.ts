import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scanEvents } from '@/lib/db/schema';
import { eq, between, sql } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess } from '@/lib/api/response';

export const GET = withApiAuth(async (req, ctx) => {
  const { params } = req;
  const id = params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'QR ID required.', 400);

  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '24h';
  const tz = searchParams.get('tz') || 'UTC';
  // Simplified date range
  const now = new Date();
  let startDate: Date;
  switch (range) {
    case '7d': startDate = new Date(now.getTime() - 7 * 86400000); break;
    case '30d': startDate = new Date(now.getTime() - 30 * 86400000); break;
    case '90d': startDate = new Date(now.getTime() - 90 * 86400000); break;
    default: startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

   const events = await db
     .select({
       country: scanEvents.country,
       deviceType: scanEvents.deviceType,
       os: scanEvents.os,
       ipHash: scanEvents.ipHash,
       hour: sql<Date>`date_trunc('hour', ${scanEvents.scannedAt})`,
     })
     .from(scanEvents)
     .where(and(eq(scanEvents.qrId, id), between(scanEvents.scannedAt, startDate, now)));

   // Summary
   const total = events.length;
   const unique = new Set(events.map(e => e.ipHash || '')).size;

  // Timeline: daily counts
  const timelineMap: Record<string, number> = {};
  events.forEach(e => {
    const d = new Date(e.hour!).toISOString().split('T')[0];
    timelineMap[d] = (timelineMap[d] || 0) + 1;
  });
  const timeline = Object.entries(timelineMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  // By country
  const countryMap: Record<string, number> = {};
  events.forEach(e => { const c = e.country || 'XX'; countryMap[c] = (countryMap[c] || 0) + 1; });
  const by_country = Object.entries(countryMap).map(([country, count]) => ({ country, count }));

  // By device
  const deviceMap: Record<string, number> = {};
  events.forEach(e => { const d = e.deviceType || 'unknown'; deviceMap[d] = (deviceMap[d] || 0) + 1; });
  const by_device = Object.entries(deviceMap).map(([device_type, count]) => ({ device_type, count }));

  // By OS
  const osMap: Record<string, number> = {};
  events.forEach(e => { const os = e.os || 'unknown'; osMap[os] = (osMap[os] || 0) + 1; });
  const by_os = Object.entries(osMap).map(([os, count]) => ({ os, count }));

  // By hour of day
  const hourMap: Record<number, number> = {};
  events.forEach(e => { const h = new Date(e.hour!).getHours(); hourMap[h] = (hourMap[h] || 0) + 1; });
  const by_hour_of_day = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: hourMap[i] || 0 }));

  // Simulated top referrers (would need referrer data)
  const top_referrers: Array<{ referrer: string; count: number }> = [];

  return apiSuccess({
    summary: { total, unique },
    timeline,
    by_country,
    by_device,
    by_os,
    by_hour_of_day,
    top_referrers,
  });
}, undefined);

import { and } from 'drizzle-orm';
import { apiError } from '@/lib/api/response';
