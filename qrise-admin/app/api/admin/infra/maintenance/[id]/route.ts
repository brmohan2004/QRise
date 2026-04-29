import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  const { title, message, endsAt, allowReadOnly, affectedFeatures } = await request.json();

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('maintenance_windows')
    .update({
      title,
      message,
      ends_at: endsAt,
      allow_read_only: allowReadOnly,
      affected_features: affectedFeatures,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'infra.maintenance_updated',
    targetType: 'system',
    targetId: id,
    details: { title, endsAt },
    ipAddress: admin.ipAddress,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  const adminClient = createAdminClient();
  
  // Actually cancelling/deactivating rather than hard delete to keep history
  const { error } = await adminClient
    .from('maintenance_windows')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'infra.maintenance_cancelled',
    targetType: 'system',
    targetId: id,
    ipAddress: admin.ipAddress,
  });

  return NextResponse.json({ success: true });
}
