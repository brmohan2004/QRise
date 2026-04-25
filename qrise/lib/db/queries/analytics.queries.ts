import { db } from '../index';
import { scanEvents, scanDailyRollups, type ScanEvent, type NewScanEvent, type ScanDailyRollup } from '../schema';
import { eq, gte, lte, desc, sql, and } from 'drizzle-orm';

export async function logScanEvent(event: NewScanEvent): Promise<ScanEvent> {
  const result = await db.insert(scanEvents).values(event).returning();
  return result[0];
}

export async function getScanSummary(
  qrId: string,
  dateRange: { from: Date; to: Date }
): Promise<{ total: number; unique: number; bot: number }> {
  const result = await db
    .select({
      total: sql<number>`count(*)`,
      unique: sql<number>`count(*) filter (where ${scanEvents.isUnique} = true)`,
      bot: sql<number>`count(*) filter (where ${scanEvents.isBot} = true)`,
    })
    .from(scanEvents)
    .where(
      and(
        eq(scanEvents.qrId, qrId),
        gte(scanEvents.scannedAt, dateRange.from),
        lte(scanEvents.scannedAt, dateRange.to)
      )
    );
  return result[0];
}

export async function getScansByCountry(
  qrId: string,
  dateRange: { from: Date; to: Date }
): Promise<{ country: string; count: number }[]> {
  const results = await db
    .select({
      country: sql<string>`coalesce(${scanEvents.country}, 'Unknown')`,
      count: sql<number>`count(*)`,
    })
    .from(scanEvents)
    .where(
      and(
        eq(scanEvents.qrId, qrId),
        gte(scanEvents.scannedAt, dateRange.from),
        lte(scanEvents.scannedAt, dateRange.to)
      )
    )
    .groupBy(sql`coalesce(${scanEvents.country}, 'Unknown')`)
    .orderBy(sql`count(*) desc`);

  return results as { country: string; count: number }[];
}

export async function getScansByDevice(
  qrId: string,
  dateRange: { from: Date; to: Date }
): Promise<{ deviceType: string; count: number }[]> {
  const results = await db
    .select({
      deviceType: sql<string>`coalesce(${scanEvents.deviceType}, 'unknown')`,
      count: sql<number>`count(*)`,
    })
    .from(scanEvents)
    .where(
      and(
        eq(scanEvents.qrId, qrId),
        gte(scanEvents.scannedAt, dateRange.from),
        lte(scanEvents.scannedAt, dateRange.to)
      )
    )
    .groupBy(sql`coalesce(${scanEvents.deviceType}, 'unknown')`);

  return results as { deviceType: string; count: number }[];
}

export async function getScansByHour(
  qrId: string,
  dateRange: { from: Date; to: Date }
): Promise<{ hour: number; count: number }[]> {
  const result = await db
    .select({
      hour: sql<number>`extract(hour from ${scanEvents.scannedAt})`,
      count: sql<number>`count(*)`,
    })
    .from(scanEvents)
    .where(
      and(
        eq(scanEvents.qrId, qrId),
        gte(scanEvents.scannedAt, dateRange.from),
        lte(scanEvents.scannedAt, dateRange.to)
      )
    )
    .groupBy(sql<number>`extract(hour from ${scanEvents.scannedAt})`);
  return result.map(r => ({ hour: Number(r.hour), count: Number(r.count) }));
}

export async function getRecentScans(qrId: string, limit = 10): Promise<ScanEvent[]> {
  return db
    .select()
    .from(scanEvents)
    .where(eq(scanEvents.qrId, qrId))
    .orderBy(desc(scanEvents.scannedAt))
    .limit(limit);
}
