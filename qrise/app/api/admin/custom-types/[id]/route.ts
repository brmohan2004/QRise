import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { 
  customQrTypes, 
  typeResolvers, 
  typeMarketplaceSubmissions, 
  adminAuditLog, 
  users, 
  qrCodes, 
  resolverCalls 
} from '@/lib/db/schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';
import { apiSuccess, apiError } from '@/lib/api/response';

// Admin guard
async function getAdminUser(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userRecord = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!userRecord[0]?.isAdmin) return null;
  
  return user;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser(request);
  if (!admin) return apiError('FORBIDDEN', 'Admin access required', 403);

  const { id } = await params;

  const typeResult = await db
    .select({
      type: customQrTypes,
      userEmail: users.email,
    })
    .from(customQrTypes)
    .leftJoin(users, eq(customQrTypes.userId, users.id))
    .where(eq(customQrTypes.id, id))
    .limit(1);

  if (!typeResult[0]) return apiError('TYPE_NOT_FOUND', 'Type not found', 404);

  // Get resolver info
  const resolver = await db
    .select()
    .from(typeResolvers)
    .where(eq(typeResolvers.typeId, id))
    .limit(1);

  // Recent resolver calls
  const recentCalls = await db
    .select()
    .from(resolverCalls)
    .where(eq(resolverCalls.resolverId, resolver[0]?.id))
    .orderBy(desc(resolverCalls.calledAt))
    .limit(50);

  return apiSuccess({
    type: typeResult[0].type,
    user_email: typeResult[0].userEmail,
    resolver: resolver[0],
    recent_calls: recentCalls,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser(request);
  if (!admin) return apiError('FORBIDDEN', 'Admin access required', 403);

  const { id } = await params;
  const body = await request.json();
  const { action, reason, notes } = body;

  const typeRecs = await db.select().from(customQrTypes).where(eq(customQrTypes.id, id)).limit(1);
  if (!typeRecs[0]) return apiError('TYPE_NOT_FOUND', 'Type not found', 404);
  const type = typeRecs[0];

  if (action === 'verify') {
    await db
      .update(customQrTypes)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(eq(customQrTypes.id, id));

    await db
      .update(typeMarketplaceSubmissions)
      .set({ status: 'approved', reviewedBy: admin.id, reviewedAt: new Date() })
      .where(
        and(
          eq(typeMarketplaceSubmissions.typeId, id),
          eq(typeMarketplaceSubmissions.status, 'pending')
        )
      );

    await fireWebhookEvent({
      userId: type.userId,
      event: 'marketplace.submission_reviewed',
      payload: { 
        type_slug: type.slug, 
        type_id: id, 
        status: 'approved', 
        reviewed_at: new Date().toISOString() 
      },
    });

    await db.insert(adminAuditLog).values({
      adminUserId: admin.id,
      action: 'custom_type.verified',
      targetType: 'custom_qr_types',
      targetId: id,
      details: { slug: type.slug },
    });

    return apiSuccess({ ok: true, verified: true });
  }

  if (action === 'reject') {
    if (!notes) return apiError('VALIDATION_ERROR', 'Rejection notes required', 400);

    await db
      .update(typeMarketplaceSubmissions)
      .set({ status: 'rejected', reviewedBy: admin.id, reviewedAt: new Date(), notes })
      .where(
        and(
          eq(typeMarketplaceSubmissions.typeId, id),
          eq(typeMarketplaceSubmissions.status, 'pending')
        )
      );

    await fireWebhookEvent({
      userId: type.userId,
      event: 'marketplace.submission_reviewed',
      payload: { 
        type_slug: type.slug, 
        type_id: id, 
        status: 'rejected', 
        notes 
      },
    });

    await db.insert(adminAuditLog).values({
      adminUserId: admin.id,
      action: 'marketplace.submission_rejected',
      targetType: 'custom_qr_types',
      targetId: id,
      details: { slug: type.slug, notes },
    });

    return apiSuccess({ ok: true, rejected: true });
  }

  if (action === 'suspend') {
    if (!reason) return apiError('VALIDATION_ERROR', 'Reason for suspension required', 400);

    await db
      .update(customQrTypes)
      .set({ isSuspended: true, suspendReason: reason, updatedAt: new Date() })
      .where(eq(customQrTypes.id, id));

    await db
      .update(typeResolvers)
      .set({ isActive: false })
      .where(eq(typeResolvers.typeId, id));

    await fireWebhookEvent({
      userId: type.userId,
      event: 'type.suspended',
      payload: { 
        type_slug: type.slug, 
        type_id: id, 
        reason 
      },
    });

    await db.insert(adminAuditLog).values({
      adminUserId: admin.id,
      action: 'custom_type.suspended',
      targetType: 'custom_qr_types',
      targetId: id,
      details: { slug: type.slug, reason },
    });

    return apiSuccess({ ok: true, suspended: true });
  }

  return apiError('VALIDATION_ERROR', 'Invalid action', 400);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser(request);
  if (!admin) return apiError('FORBIDDEN', 'Admin access required', 403);

  const { id } = await params;

  const qrCountResult = await db
    .select({ count: count() })
    .from(qrCodes)
    .where(eq(qrCodes.customTypeId, id));

  if (Number(qrCountResult[0]?.count || 0) > 0) {
    return apiError('TYPE_IN_USE', 'Cannot delete: active QRs exist using this type', 409);
  }

  await db.delete(customQrTypes).where(eq(customQrTypes.id, id));

  await db.insert(adminAuditLog).values({
    adminUserId: admin.id,
    action: 'custom_type.deleted',
    targetType: 'custom_qr_types',
    targetId: id,
  });

  return new NextResponse(null, { status: 204 });
}
