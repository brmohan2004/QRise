import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getPlanRateLimits } from '@/lib/api/rate-limit-config';

export const GET = withApiAuth(async (req, ctx) => {
  const { user, apiKey, plan, limits, requestId } = ctx;

  // Get full user info
  const userData = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      plan: users.plan,
      planExpiresAt: users.planExpiresAt,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!userData[0]) {
    return apiError('INVALID_API_KEY', 'User not found.', 404);
  }

  const u = userData[0];

  return apiSuccess({
    user: {
      id: u.id,
      email: u.email,
      full_name: u.fullName,
      plan: u.plan,
      plan_expires_at: u.planExpiresAt,
    },
    api_key: {
      name: apiKey.name,
      scopes: apiKey.scopes,
      environment: apiKey.environment,
      created_at: apiKey.createdAt,
      last_used_at: apiKey.lastUsedAt,
    },
    limits,
  });
}, undefined);

