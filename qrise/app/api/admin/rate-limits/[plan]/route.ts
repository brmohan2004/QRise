import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { planRateLimits, adminAuditLog, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { bustRateLimitCache } from '@/lib/api/rate-limit-config';
import { apiSuccess, apiError } from '@/lib/api/response';

export async function PATCH(request: Request, { params }: { params: Promise<{ plan: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return apiError('FORBIDDEN', 'Authentication required', 401);
  
  const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!userRecord[0]?.isAdmin) {
    return apiError('FORBIDDEN', 'Admin access required', 403);
  }

  const { plan } = await params;
  const body = await request.json();
  
  // Fetch current state for audit log
  const currentRows = await db.select().from(planRateLimits).where(eq(planRateLimits.plan, plan)).limit(1);
  if (!currentRows[0]) {
    return apiError('TYPE_NOT_FOUND', 'Plan not found', 404);
  }
  const before = currentRows[0];

  const allowedFields = [
    'rpm', 'rpd', 'maxBurst', 
    'imageRendersPerMonth', 'embedRendersPerMonth', 
    'resolverCallsPerMonth', 'apiCallsPerMonth', 
    'maxWebhooks', 'maxCustomTypes', 'maxResolverTimeoutMs'
  ];

  const updates: Record<string, any> = {};
  
  // Handle both snake_case (from body) and camelCase (for schema)
  const bodyToSchemaMap: Record<string, string> = {
    'max_burst': 'maxBurst',
    'image_renders_per_month': 'imageRendersPerMonth',
    'embed_renders_per_month': 'embedRendersPerMonth',
    'resolver_calls_per_month': 'resolverCallsPerMonth',
    'api_calls_per_month': 'apiCallsPerMonth',
    'max_webhooks': 'maxWebhooks',
    'max_custom_types': 'maxCustomTypes',
    'max_resolver_timeout_ms': 'maxResolverTimeoutMs'
  };

  Object.entries(body).forEach(([key, value]) => {
    const schemaKey = bodyToSchemaMap[key] || key;
    if (allowedFields.includes(schemaKey) && value !== undefined) {
      updates[schemaKey] = typeof value === 'string' ? parseInt(value, 10) : value;
    }
  });

  if (Object.keys(updates).length === 0) {
    return apiError('VALIDATION_ERROR', 'No valid update fields provided', 400);
  }

  updates.updatedAt = new Date();
  updates.updatedByAdminId = user.id;

  const updatedRows = await db
    .update(planRateLimits)
    .set(updates)
    .where(eq(planRateLimits.plan, plan))
    .returning();

  const after = updatedRows[0];

  await bustRateLimitCache(plan);

  // Detailed Audit log
  await db.insert(adminAuditLog).values({
    adminUserId: user.id,
    action: 'rate_limit.updated',
    targetType: 'plan_rate_limits',
    targetId: after.id,
    details: { plan, before, after },
  });

  return apiSuccess({ plan: after });
}
