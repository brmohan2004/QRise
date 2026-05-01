import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { customQrTypes, users } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return apiError('FORBIDDEN', 'Authentication required', 401);
  
  const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!userRecord[0]?.isAdmin) {
    return apiError('FORBIDDEN', 'Admin access required', 403);
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') || 'all';

  let filter: any = undefined;
  if (scope === 'queue') {
    filter = and(eq(customQrTypes.isPublic, true), eq(customQrTypes.isVerified, false));
  } else if (scope === 'verified') {
    filter = eq(customQrTypes.isVerified, true);
  }

  const types = await db
    .select({
      id: customQrTypes.id,
      slug: customQrTypes.slug,
      name: customQrTypes.name,
      userId: customQrTypes.userId,
      isPublic: customQrTypes.isPublic,
      isVerified: customQrTypes.isVerified,
      isSuspended: customQrTypes.isSuspended,
      createdAt: customQrTypes.createdAt,
      userEmail: users.email,
    })
    .from(customQrTypes)
    .leftJoin(users, eq(customQrTypes.userId, users.id))
    .where(filter)
    .limit(100);

  return apiSuccess({ types });
}
