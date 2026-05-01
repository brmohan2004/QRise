import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get('scope') || 'all';

  const supabase = createAdminClient();

  try {
    let query = supabase
      .from('custom_qr_types')
      .select(`
        *,
        users:user_id (email)
      `);

    if (scope === 'verified') {
      query = query.eq('is_verified', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch QR counts for each type
    const { data: counts } = await supabase
      .from('qr_codes')
      .select('custom_type_id')
      .not('custom_type_id', 'is', null);

    const countMap: Record<string, number> = {};
    counts?.forEach(c => {
      countMap[c.custom_type_id] = (countMap[c.custom_type_id] || 0) + 1;
    });

    const formattedData = data.map(item => ({
      ...item,
      user_email: item.users?.email || 'Unknown',
      qr_count: countMap[item.id] || 0
    }));

    return NextResponse.json({ data: formattedData });

  } catch (error: any) {
    console.error('Custom Types Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
