import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const supabase = createAdminClient();
  const { data: webhooks, error: webhookError } = await supabase
    .from('webhooks')
    .select('*')
    .order('created_at', { ascending: false });

  if (webhookError) {
    return NextResponse.json({ error: webhookError.message }, { status: 500 });
  }

  // Fetch users for these webhooks
  const userIds = [...new Set(webhooks.map(w => w.user_id))];
  const { data: users } = await supabase
    .from('users')
    .select('id, email, full_name')
    .in('id', userIds);

  const userMap = (users || []).reduce((acc: any, u) => {
    acc[u.id] = u;
    return acc;
  }, {});

  const data = webhooks.map(w => ({
    ...w,
    users: userMap[w.user_id] || null
  }));

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id, ...updates } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('webhooks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
