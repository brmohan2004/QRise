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
  const { message, type, is_active, link_text, link_url, show_to_plans, ends_at } = await request.json();

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('announcements')
    .update({
      message,
      type,
      is_active,
      link_text,
      link_url,
      show_to_plans,
      ends_at,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'infra.announcement_updated',
    targetType: 'system',
    targetId: id,
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
  const { error } = await adminClient
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'infra.announcement_deleted',
    targetType: 'system',
    targetId: id,
    ipAddress: admin.ipAddress,
  });

  return NextResponse.json({ success: true });
}
