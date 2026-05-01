import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return apiError('UNAUTHORIZED', 'You must be logged in to enable overages.', 401);
    }

    const { enabled } = await req.json();

    if (typeof enabled !== 'boolean') {
      return apiError('BAD_REQUEST', 'Field "enabled" must be a boolean.', 400);
    }

    // Update user
    await db.update(users)
      .set({ allowOverages: enabled })
      .where(eq(users.id, user.id));

    return apiSuccess({ enabled });
  } catch (error) {
    console.error('Failed to update overage settings:', error);
    return apiError('INTERNAL_ERROR', 'Failed to update overage settings.', 500);
  }
}
