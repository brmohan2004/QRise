import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if ('error' in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('platform_config')
    .select('value')
    .eq('key', 'admin_module_status')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is not found
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Default status if not set
  const defaultStatus = {
    api_monitor: true,
    system_health: true,
    analytics: true,
    revenue: true,
    webhooks: true,
    audit_logs: true
  };

  return NextResponse.json(data?.value || defaultStatus);
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if ('error' in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { status } = await req.json();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('platform_config')
    .upsert({
      key: 'admin_module_status',
      value: status,
    }, { onConflict: 'key' });

  if (error) {
    console.error('Config Update Error:', error);
    return NextResponse.json({ error: error.message, details: error.details, code: error.code }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
