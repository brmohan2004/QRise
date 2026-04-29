import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/audit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const adminClient = createAdminClient();
  const { data: config, error } = await adminClient
    .from('platform_config')
    .select('*')
    .order('key');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(config);
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const { key, value, reason } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch current value for audit log
    const { data: currentConfig, error: fetchError } = await adminClient
      .from('platform_config')
      .select('value')
      .eq('key', key)
      .single();

    if (fetchError || !currentConfig) {
      return NextResponse.json({ error: 'Config key not found or inaccessible' }, { status: 404 });
    }

    // Update DB
    const { error: updateError } = await adminClient
      .from('platform_config')
      .update({
        value,
        updated_by: admin.adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key);

    if (updateError) {
      console.error('[CONFIG UPDATE ERROR]', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update Redis for critical keys
    try {
      if (key === 'maintenance_mode') {
        if (value === 'true' || value === true) {
          await redis.set('platform:maintenance', 'true', { ex: 86400 });
        } else {
          await redis.del('platform:maintenance');
        }
      }

      if (key === 'read_only_mode') {
        if (value === 'true' || value === true) {
          await redis.set('platform:read_only', 'true');
        } else {
          await redis.del('platform:read_only');
        }
      }
    } catch (redisError) {
      console.warn('[REDIS SYNC ERROR]', redisError);
      // We don't fail the whole request if Redis sync fails, but we should log it
    }

    // Write Audit Log
    await writeAuditLog({
      adminUserId: admin.adminId,
      action: 'infra.config_updated',
      targetType: 'system',
      targetId: key,
      details: {
        key,
        before: currentConfig.value,
        after: value,
        reason,
      },
      ipAddress: admin.ipAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[CONFIG ROUTE EXCEPTION]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
