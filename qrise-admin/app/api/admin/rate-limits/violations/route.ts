import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const ip = searchParams.get('ip');
  const page = parseInt(searchParams.get('page') || '0');
  const pageSize = 50;

  const supabase = createAdminClient();
  
  let query = supabase
    .from('rate_limit_violations')
    .select('*, users(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (userId) query = query.eq('user_id', userId);
  if (ip) query = query.eq('ip_address', ip);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    violations: data,
    total: count,
    page,
    pageSize
  });
}
