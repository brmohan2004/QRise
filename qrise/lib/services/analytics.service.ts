import { db } from '@/lib/db';
import { scanEvents, qrCodes, users, type ScanEvent } from '@/lib/db/schema';
import { eq, gte, lte, desc, sql, and } from 'drizzle-orm';

export async function getScanSummary(
  qrId: string,
  range: { from: Date; to: Date }
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
        gte(scanEvents.scannedAt, range.from),
        lte(scanEvents.scannedAt, range.to)
      )
    );
  return result[0] || { total: 0, unique: 0, bot: 0 };
}

export async function getDashboardStats(
  userId: string
): Promise<{
  totalQrs: number;
  totalScans: number;
  activeQrs: number;
  scansToday: number;
}> {
  const qrList = await db
    .select({
      id: qrCodes.id,
    })
    .from(qrCodes)
    .where(eq(qrCodes.userId, userId));
  
  const qrIds = qrList.map(q => q.id);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let totalScans = 0;
  let scansToday = 0;
  
  if (qrIds.length > 0) {
    const scanCount = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(scanEvents)
      .where(sql`${scanEvents.qrId} in ${qrIds}`);
    
    totalScans = scanCount[0]?.total || 0;
    
    const todayCount = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(scanEvents)
      .where(
        and(
          sql`${scanEvents.qrId} in ${qrIds}`,
          gte(scanEvents.scannedAt, today)
        )
      );
    scansToday = todayCount[0]?.total || 0;
  }
  
  return {
    totalQrs: qrList.length,
    totalScans,
    activeQrs: qrList.filter(q => q).length,
    scansToday,
  };
}

export async function getRecentActivity(
  userId: string,
  limit = 10
): Promise<ScanEvent[]> {
  const qrList = await db.select({ id: qrCodes.id }).from(qrCodes).where(eq(qrCodes.userId, userId));
  const qrIds = qrList.map(q => q.id);
  
  if (qrIds.length === 0) return [];
  
  return db
    .select()
    .from(scanEvents)
    .where(sql`${scanEvents.qrId} in ${qrIds}`)
    .orderBy(desc(scanEvents.scannedAt))
    .limit(limit);
}