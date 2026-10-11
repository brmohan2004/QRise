import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { qrCodes, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return apiError('FORBIDDEN', 'Authentication required', 401);

    const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, user.id)).limit(1);
    if (!userRecord[0]?.isAdmin) {
      return apiError('FORBIDDEN', 'Admin access required', 403);
    }

    // 1. Fetch QR code
    const existing = await db.select().from(qrCodes).where(eq(qrCodes.id, id)).limit(1);
    if (!existing[0]) {
      return apiError('NOT_FOUND', 'QR code not found', 404);
    }

    const qr = existing[0];

    // 2. Restore QR code
    const updated = await db
      .update(qrCodes)
      .set({
        isDeleted: false,
        deletedAt: null,
        status: 'active',
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(qrCodes.id, id))
      .returning();

    return apiSuccess({
      message: 'QR code successfully restored and reactivated',
      qr: updated[0],
    });
  } catch (error: any) {
    console.error('Admin QR restore error:', error);
    return apiError('INTERNAL_ERROR', error.message || 'Failed to restore QR code', 500);
  }
}
