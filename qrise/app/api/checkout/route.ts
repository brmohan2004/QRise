import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { plans, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, isAnnual, couponCode } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Fetch user details from DB
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

    if (dbUser?.stripeSubscriptionId && dbUser.billingStatus === 'active') {
      return NextResponse.json({ error: 'You already have an active subscription. Please use the billing portal to manage it.' }, { status: 400 });
    }

    // Fetch plan details from DB
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const price = isAnnual ? Number(plan.priceAnnual) : Number(plan.priceMonthly);
    const interval = isAnnual ? 'year' : 'month';

    if (price === 0) {
      return NextResponse.json({ error: 'Cannot checkout a free plan' }, { status: 400 });
    }

    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `QRise ${plan.name} Plan`,
              description: plan.description || '',
            },
            unit_amount: Math.round(price * 100),
            recurring: {
              interval: interval as any,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        plan: plan.name.toLowerCase(),
        isAnnual: String(isAnnual),
      },
    };

    if (dbUser?.stripeCustomerId) {
      sessionParams.customer = dbUser.stripeCustomerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    if (couponCode) {
      sessionParams.discounts = [{ coupon: couponCode }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
