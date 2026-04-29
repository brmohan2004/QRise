import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/audit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Maintenance ID is required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // 1. Deactivate any existing active windows
  await adminClient
    .from('maintenance_windows')
    .update({ is_active: false })
    .eq('is_active', true);

  // 2. Activate the target window
  const { data, error } = await adminClient
    .from('maintenance_windows')
    .update({ 
      is_active: true,
      starts_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. Set Redis keys for fast lookup
  await redis.set('platform:maintenance', 'true', { ex: 86400 });
  await redis.set(`platform:maintenance:${id}`, data.message, { ex: 86400 });

  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'infra.maintenance_activated',
    targetType: 'system',
    targetId: id,
    details: { message: data.message },
    ipAddress: admin.ipAddress,
  });

  return NextResponse.json({ success: true, window: data });
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const adminClient = createAdminClient();

  // Deactivate all active windows
  const { error } = await adminClient
    .from('maintenance_windows')
    .update({ is_active: false })
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Clear Redis keys
  await redis.del('platform:maintenance');
  // Note: specific IDs will expire, but we could also scan and delete if needed.
  // For now, deleting the main flag is enough to let traffic through.

  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'infra.maintenance_deactivated',
    targetType: 'system',
    targetId: 'global',
    ipAddress: admin.ipAddress,
  });

  return NextResponse.json({ success: true });
}
