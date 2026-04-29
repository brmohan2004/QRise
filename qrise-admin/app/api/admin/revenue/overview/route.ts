import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin(req);
    if ('error' in adminResult) {
      return NextResponse.json({ error: adminResult.error }, { status: adminResult.status });
    }

    const supabase = createAdminClient();

    // 1. Fetch Plan Prices
    const { data: allPlans, error: plansError } = await supabase
      .from('plans')
      .select('name, price_monthly');

    if (plansError) throw plansError;

    const planPrices: Record<string, number> = {};
    allPlans?.forEach(p => {
      planPrices[p.name.toLowerCase()] = Math.round(parseFloat(p.price_monthly || '0') * 100);
    });

    // 2. Fetch Users and calculate MRR
    const { data: mrrData, error: mrrError } = await supabase
      .from('users')
      .select('plan')
      .eq('billing_status', 'active');

    if (mrrError) throw mrrError;

    let mrrCents = 0;
    const planCounts: Record<string, number> = {};
    const planMrrCents: Record<string, number> = {};

    mrrData.forEach(u => {
      const planName = u.plan.toLowerCase();
      const price = planPrices[planName] || 0;
      mrrCents += price;
      
      planCounts[planName] = (planCounts[planName] || 0) + 1;
      planMrrCents[planName] = (planMrrCents[planName] || 0) + price;
    });

    const mrr = mrrCents / 100;
    const arr = mrr * 12;

    // 3. Total Revenue (all time from billing_events)
    const { data: totalRevData, error: totalRevError } = await supabase
      .from('billing_events')
      .select('amount_cents')
      .eq('status', 'succeeded');

    if (totalRevError) throw totalRevError;
    const totalRevenue = (totalRevData?.reduce((sum, e) => sum + (e.amount_cents || 0), 0) || 0) / 100;

    // 4. Revenue This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthRevData, error: monthRevError } = await supabase
      .from('billing_events')
      .select('amount_cents')
      .eq('status', 'succeeded')
      .gte('created_at', startOfMonth.toISOString());

    if (monthRevError) throw monthRevError;
    const revenueThisMonth = (monthRevData?.reduce((sum, e) => sum + (e.amount_cents || 0), 0) || 0) / 100;

    // 5. Revenue Last Month
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);
    
    const endOfLastMonth = new Date();
    endOfLastMonth.setMonth(endOfLastMonth.getMonth()); 
    endOfLastMonth.setDate(0); 
    endOfLastMonth.setHours(23, 59, 59, 999);

    const { data: lastMonthRevData, error: lastMonthRevError } = await supabase
      .from('billing_events')
      .select('amount_cents')
      .eq('status', 'succeeded')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    if (lastMonthRevError) throw lastMonthRevError;
    const revenueLastMonth = (lastMonthRevData?.reduce((sum, e) => sum + (e.amount_cents || 0), 0) || 0) / 100;

    const mrrGrowthPercent = revenueLastMonth > 0 
      ? parseFloat((((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1))
      : 0;


    // 6. Failed Payments
    const { count: failedPayments, error: failedError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('billing_status', 'past_due');

    if (failedError) throw failedError;

    // 7. Revenue by Day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: dailyRevData, error: dailyRevError } = await supabase
      .from('billing_events')
      .select('created_at, amount_cents')
      .eq('status', 'succeeded')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (dailyRevError) throw dailyRevError;

    const dailyRevenue: Record<string, number> = {};
    dailyRevData?.forEach(e => {
      const date = e.created_at.split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (e.amount_cents || 0) / 100;
    });

    const revenueByDay = Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));

    // 8. Trial Users
    const { count: trialUsers, error: trialError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('trial_ends_at', new Date().toISOString());

    if (trialError) throw trialError;

    // 9. Churned and New Subscriptions (last 30 days)
    const { count: churned30d, error: churnError } = await supabase
      .from('billing_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'customer.subscription.deleted')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (churnError) throw churnError;

    const { count: newSubscriptions30d, error: newError } = await supabase
      .from('billing_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'checkout.session.completed')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (newError) throw newError;

    // 10. Lifetime Customers
    const { count: lifetimeCustomers, error: ltvError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('lifetime_value_cents', 0);

    if (ltvError) throw ltvError;

    const churnRate = (lifetimeCustomers || 0) > 0 
      ? parseFloat((((churned30d || 0) / (lifetimeCustomers || 1)) * 100).toFixed(1))
      : 0;

    const revenueByPlan = Object.entries(planCounts).map(([plan, count]) => ({
      plan,
      mrr: (planMrrCents[plan] || 0) / 100,
      userCount: count
    })).sort((a, b) => b.mrr - a.mrr);

    return NextResponse.json({
      mrr,
      arr,
      mrrGrowthPercent,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      revenueByPlan,
      revenueByDay,
      churned30d: churned30d || 0,
      newSubscriptions30d: newSubscriptions30d || 0,
      failedPayments: failedPayments || 0,
      trialUsers: trialUsers || 0,
      lifetimeCustomers: lifetimeCustomers || 0,
      churnRate
    });


  } catch (error: any) {
    console.error('Revenue Overview Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
