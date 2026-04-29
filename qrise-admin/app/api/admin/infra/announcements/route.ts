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
  const { data: announcements, error } = await adminClient
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const { message, type, linkText, linkUrl, showToPlans, endsAt } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('announcements')
      .insert({
        message,
        type: type || 'info',
        link_text: linkText,
        link_url: linkUrl,
        show_to_plans: showToPlans || null,
        ends_at: endsAt || null, // Fix empty string issue
        created_by: admin.adminId,
      })
      .select()
      .single();

    if (error) {
      console.error('[ANNOUNCEMENT INSERT ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await writeAuditLog({
      adminUserId: admin.adminId,
      action: 'infra.announcement_created',
      targetType: 'system',
      targetId: data.id,
      details: { message, type },
      ipAddress: admin.ipAddress,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ANNOUNCEMENT ROUTE EXCEPTION]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
