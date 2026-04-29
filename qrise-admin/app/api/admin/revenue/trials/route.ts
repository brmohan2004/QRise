import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin(req);
    if ('error' in adminResult) return NextResponse.json({ error: adminResult.error }, { status: adminResult.status });

    const supabase = createAdminClient();
    const { data: trials, error } = await supabase
      .from('users')
      .select('id, email, plan, trial_ends_at, stripe_customer_id')
      .gte('trial_ends_at', new Date().toISOString())
      .order('trial_ends_at', { ascending: true });

    if (error) throw error;

    const results = trials.map(user => ({
      userId: user.id,
      email: user.email,
      trialEndsAt: user.trial_ends_at,
      daysRemaining: Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      hasAddedPaymentMethod: !!user.stripe_customer_id,
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin(req);
    if ('error' in adminResult) return NextResponse.json({ error: adminResult.error }, { status: adminResult.status });

    const adminId = adminResult.adminId;

    const body = await req.json();
    const { action, userId, days, plan, reason } = body;

    const supabase = createAdminClient();

    if (action === 'extend') {
      const { data: user } = await supabase.from('users').select('trial_ends_at').eq('id', userId).single();
      if (!user) throw new Error('User not found');

      const currentEnd = new Date(user.trial_ends_at || new Date());
      const newEnd = new Date(currentEnd.getTime() + (days * 24 * 60 * 60 * 1000));

      await supabase.from('users').update({ trial_ends_at: newEnd.toISOString() }).eq('id', userId);
      await supabase.from('audit_logs').insert({
        action: 'revenue.trial_extended',
        admin_id: adminId,
        details: { userId, days, reason, newEnd },
      });
    } else if (action === 'convert') {
      await supabase.from('users').update({ 
        plan: plan || 'pro', 
        trial_ends_at: null,
        billing_status: 'active' 
      }).eq('id', userId);
      
      await supabase.from('audit_logs').insert({
        action: 'revenue.trial_converted',
        admin_id: adminId,
        details: { userId, plan, reason },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
