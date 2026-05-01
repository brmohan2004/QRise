import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usageAlertChannels } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';

export const DELETE = withApiAuth(async (req, ctx) => {
  const { user } = ctx;
  const { id } = req.params as { id: string };

  if (!id) return apiError('VALIDATION_ERROR', 'ID is required.', 400);

  const deleted = await ctx.db
    .delete(usageAlertChannels)
    .where(and(eq(usageAlertChannels.id, id), eq(usageAlertChannels.userId, user.id)))
    .returning();

  if (!deleted.length) return apiError('NOT_FOUND', 'Channel not found.', 404);

  return new NextResponse(null, { status: 204 });
}, undefined);
