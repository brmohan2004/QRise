import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin(req);
    if ('error' in adminResult) return NextResponse.json({ error: adminResult.error }, { status: adminResult.status });

    const supabase = createAdminClient();

    const { data: failedUsers, error } = await supabase
      .from('users')
      .select('id, email, plan, billing_status, stripe_customer_id, stripe_subscription_id')
      .eq('billing_status', 'past_due');

    if (error) throw error;

    // Fetch last failed events for these users
    const results = await Promise.all(failedUsers.map(async (user) => {
      const { data: events } = await supabase
        .from('billing_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastEvent = events?.[0];
      const daysPastDue = lastEvent 
        ? Math.floor((Date.now() - new Date(lastEvent.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        userId: user.id,
        email: user.email,
        plan: user.plan,
        amount: (lastEvent?.amount_cents || 0) / 100,
        failureReason: lastEvent?.failure_reason || 'Unknown',
        daysPastDue,
        retryCount: lastEvent?.metadata?.retry_count || 0,
        stripeInvoiceId: lastEvent?.stripe_invoice_id,
      };
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

    const { userId, stripeInvoiceId } = await req.json();
    if (!userId || !stripeInvoiceId) {
      return NextResponse.json({ error: 'Missing userId or stripeInvoiceId' }, { status: 400 });
    }

    // Call Stripe to retry payment
    const invoice = await stripe.invoices.pay(stripeInvoiceId);

    // Audit log
    const supabase = createAdminClient();
    await supabase.from('audit_logs').insert({
      action: 'revenue.payment_retry_triggered',
      admin_id: adminId,
      details: { userId, stripeInvoiceId, status: invoice.status },
    });

    return NextResponse.json({ success: true, status: invoice.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
