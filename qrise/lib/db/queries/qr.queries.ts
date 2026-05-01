import { db } from '../index';
import { qrCodes, type QRCode, type NewQRCode } from '../schema';
import { eq, desc, and, ilike } from 'drizzle-orm';

export interface QRFilters {
  type?: string;
  status?: 'active' | 'inactive';
  search?: string;
}

export async function getUserQRCodes(
  userId: string,
  filters?: QRFilters,
  limit = 20,
  offset = 0
): Promise<QRCode[]> {
  const conditions = [eq(qrCodes.userId, userId)];
  
  if (filters?.type) {
    conditions.push(eq(qrCodes.type, filters.type));
  }
  if (filters?.status === 'active') {
    conditions.push(eq(qrCodes.isActive, true));
  } else if (filters?.status === 'inactive') {
    conditions.push(eq(qrCodes.isActive, false));
  }
  if (filters?.search) {
    conditions.push(ilike(qrCodes.name, `%${filters.search}%`));
  }
  
  return db
    .select()
    .from(qrCodes)
    .where(and(...conditions))
    .orderBy(desc(qrCodes.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getQRById(id: string): Promise<QRCode | undefined> {
  const result = await db.select().from(qrCodes).where(eq(qrCodes.id, id)).limit(1);
  return result[0];
}

export async function getQRByShortCode(shortCode: string): Promise<QRCode | undefined> {
  const result = await db.select().from(qrCodes).where(eq(qrCodes.shortCode, shortCode)).limit(1);
  return result[0];
}

export async function createQR(data: NewQRCode): Promise<QRCode> {
  const result = await db.insert(qrCodes).values(data).returning();
  return result[0];
}

export async function updateQR(id: string, data: Partial<NewQRCode>): Promise<QRCode> {
  const result = await db
    .update(qrCodes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(qrCodes.id, id))
    .returning();
  return result[0];
}

export async function deleteQR(id: string): Promise<void> {
  await db.update(qrCodes).set({ isActive: false }).where(eq(qrCodes.id, id));
}
