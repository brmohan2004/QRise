import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '24h';
  
  // Calculate date filter
  const now = new Date();
  let dateFilter = new Date();
  if (range === '24h') dateFilter.setHours(now.getHours() - 24);
  else if (range === '7d') dateFilter.setDate(now.getDate() - 7);
  else if (range === '30d') dateFilter.setDate(now.getDate() - 30);
  else dateFilter.setHours(now.getHours() - 24); // Default 24h

  const supabase = createAdminClient();

  try {
    // 1. Fetch all events in range
    const { data: events, error: eventsError } = await supabase
      .from('api_usage_events')
      .select(`
        *,
        users:user_id (email, plan)
      `)
      .gte('called_at', dateFilter.toISOString());

    if (eventsError) throw eventsError;

    // 2. Aggregate Summary
    const totalCalls = events.length;
    const errors = events.filter(e => e.status_code >= 400).length;
    const totalLatency = events.reduce((acc, e) => acc + (e.latency_ms || 0), 0);
    const uniqueKeys = new Set(events.map(e => e.api_key_id)).size;

    const summary = {
      total_calls: totalCalls,
      avg_latency: totalCalls > 0 ? Math.round(totalLatency / totalCalls) : 0,
      error_rate: totalCalls > 0 ? (errors / totalCalls) * 100 : 0,
      active_keys: uniqueKeys
    };

    // 3. Aggregate By Endpoint
    const endpointMap: Record<string, any> = {};
    events.forEach(e => {
      if (!endpointMap[e.endpoint]) {
        endpointMap[e.endpoint] = { endpoint: e.endpoint, calls: 0, total_latency: 0, errors: 0 };
      }
      const item = endpointMap[e.endpoint];
      item.calls++;
      item.total_latency += (e.latency_ms || 0);
      if (e.status_code >= 400) item.errors++;
    });

    const byEndpoint = Object.values(endpointMap).map(item => ({
      endpoint: item.endpoint,
      calls: item.calls,
      avg_latency_ms: Math.round(item.total_latency / item.calls),
      error_rate: (item.errors / item.calls) * 100
    })).sort((a, b) => b.calls - a.calls);

    // 4. Aggregate Top Users
    const userMap: Record<string, any> = {};
    events.forEach(e => {
      const uId = e.user_id;
      if (!userMap[uId]) {
        userMap[uId] = { 
          user_id: uId, 
          email: e.users?.email || 'Unknown', 
          plan: e.users?.plan || 'free', 
          calls: 0, 
          errors: 0,
          keys: new Set() 
        };
      }
      const item = userMap[uId];
      item.calls++;
      if (e.status_code >= 400) item.errors++;
      item.keys.add(e.api_key_id);
    });

    const topUsers = Object.values(userMap).map(item => ({
      user_id: item.user_id,
      email: item.email,
      plan: item.plan,
      keys_count: item.keys.size,
      calls: item.calls,
      error_rate: (item.errors / item.calls) * 100
    })).sort((a, b) => b.calls - a.calls).slice(0, 10);

    return NextResponse.json({
      summary,
      by_endpoint: byEndpoint,
      top_users: topUsers
    });

  } catch (error: any) {
    console.error('API Usage Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
