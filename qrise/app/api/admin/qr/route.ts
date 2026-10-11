import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { qrCodes, users } from '@/lib/db/schema';
import { eq, and, lt, gte, desc, ilike, sql, or } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api/response';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return apiError('FORBIDDEN', 'Authentication required', 401);

    const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, user.id)).limit(1);
    if (!userRecord[0]?.isAdmin) {
      return apiError('FORBIDDEN', 'Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'deleted'; // 'deleted' | 'active' | 'all'
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - SEVEN_DAYS_MS);

    // 1. Auto-cleanup: permanently remove any soft-deleted QRs past the 7-day grace period
    await db.delete(qrCodes).where(
      and(
        eq(qrCodes.isDeleted, true),
        lt(qrCodes.deletedAt, sevenDaysAgo)
      )
    );

    // 2. Build query conditions
    const conditions = [];

    if (scope === 'deleted') {
      // Return soft-deleted QRs still within the 7-day retention period
      conditions.push(eq(qrCodes.isDeleted, true));
      conditions.push(gte(qrCodes.deletedAt, sevenDaysAgo));
    } else if (scope === 'active') {
      conditions.push(eq(qrCodes.isDeleted, false));
    }

    if (search) {
      conditions.push(
        or(
          ilike(qrCodes.name, `%${search}%`),
          ilike(qrCodes.shortCode, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.fullName, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 3. Query items
    const items = await db
      .select({
        id: qrCodes.id,
        name: qrCodes.name,
        type: qrCodes.type,
        shortCode: qrCodes.shortCode,
        targetUrl: qrCodes.targetUrl,
        isDynamic: qrCodes.isDynamic,
        isActive: qrCodes.isActive,
        isDeleted: qrCodes.isDeleted,
        status: qrCodes.status,
        deletedAt: qrCodes.deletedAt,
        scanCount: qrCodes.scanCount,
        destinationType: qrCodes.destinationType,
        designConfig: qrCodes.designConfig,
        createdAt: qrCodes.createdAt,
        updatedAt: qrCodes.updatedAt,
        owner: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          plan: users.plan,
        }
      })
      .from(qrCodes)
      .leftJoin(users, eq(qrCodes.userId, users.id))
      .where(whereClause)
      .orderBy(desc(qrCodes.deletedAt), desc(qrCodes.createdAt))
      .limit(limit)
      .offset(offset);

    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(qrCodes)
      .leftJoin(users, eq(qrCodes.userId, users.id))
      .where(whereClause);

    const total = Number(countRes[0]?.count || 0);

    // Augment deleted QRs with retention metadata
    const augmentedItems = items.map((item) => {
      if (item.isDeleted && item.deletedAt) {
        const deletedTime = new Date(item.deletedAt).getTime();
        const expiresAt = new Date(deletedTime + SEVEN_DAYS_MS);
        const msRemaining = expiresAt.getTime() - now.getTime();
        const retentionDaysLeft = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

        return {
          ...item,
          expiresAt: expiresAt.toISOString(),
          retentionDaysLeft,
          retrievable: msRemaining > 0,
        };
      }
      return {
        ...item,
        expiresAt: null,
        retentionDaysLeft: null,
        retrievable: false,
      };
    });

    return apiSuccess({
      items: augmentedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      retentionPolicyDays: 7,
    });
  } catch (error: any) {
    console.error('Admin QR fetch error:', error);
    return apiError('INTERNAL_ERROR', error.message || 'Failed to fetch QR codes', 500);
  }
}
