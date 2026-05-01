import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  
  try {
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select(`
        *,
        webhooks:webhook_id (endpoint_url)
      `)
      .order('delivered_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Webhook Deliveries Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
