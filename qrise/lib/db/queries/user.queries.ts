import { db } from '../index';
import { users, type User } from '../schema';
import { eq, sql } from 'drizzle-orm';

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'pro' | 'business' | 'enterprise'
): Promise<User> {
  const result = await db
    .update(users)
    .set({ plan, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return result[0];
}

export async function getUserStats(userId: string): Promise<{
  totalQrs: number;
  totalScans: number;
  activeQrs: number;
}> {
  await db
    .select({
      totalQrs: sql<number>`count(*)`,
    })
    .from(users)
    .where(eq(users.id, userId));
  return { totalQrs: 0, totalScans: 0, activeQrs: 0 };
}
