import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth-utils';
import { writeAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('type_marketplace_submissions')
    .select(`
      *,
      type:custom_qr_types(slug, name, icon_url, is_public, description),
      user:users(email, full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function PATCH(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await req.json();
  const { id, status, notes } = body;

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
  }

  // 1. Update submission record
  const { data: submission, error: subError } = await supabase
    .from('type_marketplace_submissions')
    .update({ 
      status, 
      notes: notes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (subError) return NextResponse.json({ ok: false, error: subError.message }, { status: 500 });

  // 2. If approved, set is_verified = true on the type
  if (status === 'approved') {
    await supabase
      .from('custom_qr_types')
      .update({ is_verified: true })
      .eq('id', submission.type_id);
  }

  // 3. Audit log
  await writeAuditLog({
    adminUserId: user.id,
    action: `marketplace.review.${status}`,
    targetType: 'marketplace',
    targetId: id,
    details: { status, notes, typeId: submission.type_id },
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
  });

  return NextResponse.json({ ok: true, data: submission });
}
