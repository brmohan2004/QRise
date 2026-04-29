import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin(req);
    if ('error' in adminResult) return NextResponse.json({ error: adminResult.error }, { status: adminResult.status });

    const supabase = createAdminClient();
    const { data: refunds, error } = await supabase
      .from('billing_events')
      .select('*')
      .eq('status', 'refunded')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(refunds);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin(req);
    if ('error' in adminResult) return NextResponse.json({ error: adminResult.error }, { status: adminResult.status });

    const adminId = adminResult.adminId;

    const { billingEventId, amount, reason } = await req.json();
    if (!billingEventId) return NextResponse.json({ error: 'Missing billingEventId' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: event, error: eventError } = await supabase
      .from('billing_events')
      .select('*')
      .eq('id', billingEventId)
      .single();

    if (eventError || !event) throw new Error('Payment event not found');

    const refund = await stripe.refunds.create({
      payment_intent: event.metadata?.payment_intent || event.stripe_payment_intent_id,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || 'requested_by_customer',
    });

    await supabase
      .from('billing_events')
      .update({ status: 'refunded', metadata: { ...event.metadata, refund_id: refund.id, refund_reason: reason } })
      .eq('id', billingEventId);

    await supabase.from('audit_logs').insert({
      action: 'revenue.refund_issued',
      admin_id: adminId,
      details: { billingEventId, amount, reason, refundId: refund.id },
    });

    return NextResponse.json({ success: true, refundId: refund.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
