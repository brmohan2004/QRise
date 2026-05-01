import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth-utils';
import { writeAuditLog } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { action, reason } = await request.json();
  const supabase = createAdminClient();

  try {
    let updateData: any = {};
    if (action === 'verify') {
      updateData = { is_verified: true, is_suspended: false };
    } else if (action === 'suspend') {
      updateData = { is_suspended: true, suspend_reason: reason || 'Violation of terms' };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('custom_qr_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await writeAuditLog({
      adminUserId: admin.id,
      action: `custom_type.${action}`,
      targetType: 'custom_type',
      targetId: id,
      details: { action, reason },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error('Custom Type Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from('custom_qr_types')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Audit log
    await writeAuditLog({
      adminUserId: admin.id,
      action: 'custom_type.delete',
      targetType: 'custom_type',
      targetId: id,
      details: { deleted: true },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Custom Type Delete Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
