import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { qrCodes, users, routingRules, qrActions, qrRedirectHistory } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function GET(
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

    const qr = await db.query.qrCodes.findFirst({
      where: eq(qrCodes.id, id),
      with: {
        user: true,
        routingRules: {
          orderBy: [desc(routingRules.priority)],
        },
        qrActions: {
          orderBy: [desc(qrActions.displayOrder)],
        },
      }
    });

    if (!qr) return apiError('NOT_FOUND', 'QR code not found', 404);

    const history = await db.select().from(qrRedirectHistory)
      .where(eq(qrRedirectHistory.qrId, id))
      .orderBy(desc(qrRedirectHistory.changedAt))
      .limit(10);

    return apiSuccess({ ...qr, history });
  } catch (error: any) {
    console.error('Admin QR details error:', error);
    return apiError('INTERNAL_ERROR', error.message || 'Failed to fetch QR code details', 500);
  }
}

export async function DELETE(
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

    await db.delete(qrCodes).where(eq(qrCodes.id, id));

    return apiSuccess({ message: 'QR code permanently deleted' });
  } catch (error: any) {
    console.error('Admin permanent delete error:', error);
    return apiError('INTERNAL_ERROR', error.message || 'Failed to permanently delete QR code', 500);
  }
}
