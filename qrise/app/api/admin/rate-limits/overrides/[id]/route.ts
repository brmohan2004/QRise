import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { userRateLimitOverrides, adminAuditLog, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { bustUserRateLimitCache } from '@/lib/api/rate-limit-config';
import { apiError } from '@/lib/api/response';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user: admin } } = await supabase.auth.getUser();
  
  if (!admin) return apiError('FORBIDDEN', 'Authentication required', 401);
  
  const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, admin.id)).limit(1);
  if (!userRecord[0]?.isAdmin) {
    return apiError('FORBIDDEN', 'Admin access required', 403);
  }

  const { id } = await params;

  const existing = await db
    .select({ userId: userRateLimitOverrides.userId })
    .from(userRateLimitOverrides)
    .where(eq(userRateLimitOverrides.id, id))
    .limit(1);
  
  if (!existing[0]) return apiError('UNKNOWN_ERROR', 'Override not found', 404);

  await db.delete(userRateLimitOverrides).where(eq(userRateLimitOverrides.id, id));

  await bustUserRateLimitCache(existing[0].userId);

  await db.insert(adminAuditLog).values({
    adminUserId: admin.id,
    action: 'rate_limit.override_deleted',
    targetType: 'user_rate_limit_overrides',
    targetId: id,
    details: { user_id: existing[0].userId },
  });

  return new NextResponse(null, { status: 204 });
}
