import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const targetType = searchParams.get('targetType');
  const limit = parseInt(searchParams.get('limit') || '50');

  const adminClient = createAdminClient();
  
  let query = adminClient
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (action) query = query.eq('action', action);
  if (targetType) query = query.eq('target_type', targetType);

  const { data: logs, error } = await query;

  if (error) {
    console.error('[AUDIT LOG FETCH ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(logs);
}
