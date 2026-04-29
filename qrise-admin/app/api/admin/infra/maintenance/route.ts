import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const adminClient = createAdminClient();
  const { data: windows, error } = await adminClient
    .from('maintenance_windows')
    .select('*')
    .order('starts_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const activeWindow = windows?.find(w => w.is_active);

  return NextResponse.json({ windows, activeWindow });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const { title, message, startsAt, endsAt, allowReadOnly, affectedFeatures } = await request.json();

    if (!title || !message || !startsAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (new Date(startsAt) < new Date(new Date().getTime() - 60000)) { // Allow 1 min grace
      return NextResponse.json({ error: 'Start time must be in the future' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('maintenance_windows')
      .insert({
        title,
        message,
        starts_at: startsAt,
        ends_at: endsAt || null, // Fix empty string issue
        allow_read_only: allowReadOnly ?? true,
        affected_features: affectedFeatures || null,
        created_by: admin.adminId,
      })
      .select()
      .single();

    if (error) {
      console.error('[MAINTENANCE INSERT ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog({
      adminUserId: admin.adminId,
      action: 'infra.maintenance_created',
      targetType: 'system',
      targetId: data.id,
      details: { title, startsAt, endsAt },
      ipAddress: admin.ipAddress,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[MAINTENANCE ROUTE EXCEPTION]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
