import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { userRateLimitOverrides, users, adminAuditLog } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { bustUserRateLimitCache } from '@/lib/api/rate-limit-config';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user: admin } } = await supabase.auth.getUser();
  
  if (!admin) return apiError('FORBIDDEN', 'Authentication required', 401);
  
  const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, admin.id)).limit(1);
  if (!userRecord[0]?.isAdmin) {
    return apiError('FORBIDDEN', 'Admin access required', 403);
  }

  const overrides = await db
    .select({
      id: userRateLimitOverrides.id,
      userId: userRateLimitOverrides.userId,
      override: userRateLimitOverrides.override,
      reason: userRateLimitOverrides.reason,
      expiresAt: userRateLimitOverrides.expiresAt,
      createdAt: userRateLimitOverrides.createdAt,
      userEmail: users.email,
    })
    .from(userRateLimitOverrides)
    .leftJoin(users, eq(userRateLimitOverrides.userId, users.id))
    .orderBy(desc(userRateLimitOverrides.createdAt));

  return apiSuccess({ overrides });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user: admin } } = await supabase.auth.getUser();
  
  if (!admin) return apiError('FORBIDDEN', 'Authentication required', 401);
  
  const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, admin.id)).limit(1);
  if (!userRecord[0]?.isAdmin) {
    return apiError('FORBIDDEN', 'Admin access required', 403);
  }

  const body = await request.json();
  const { user_id, override, reason, expires_at } = body;

  if (!user_id || !override) {
    return apiError('VALIDATION_ERROR', 'user_id and override required', 400);
  }

  const inserted = await db
    .insert(userRateLimitOverrides)
    .values({
      userId: user_id,
      override,
      reason,
      createdByAdminId: admin.id,
      expiresAt: expires_at ? new Date(expires_at) : null,
    })
    .returning();

  await bustUserRateLimitCache(user_id);

  // Audit log
  await db.insert(adminAuditLog).values({
    adminUserId: admin.id,
    action: 'rate_limit.override_created',
    targetType: 'user_rate_limit_overrides',
    targetId: inserted[0].id,
    details: { user_id, override, reason, expires_at },
  });

  return apiSuccess({ override: inserted[0] });
}

