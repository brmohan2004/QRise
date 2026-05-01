import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user from DB to get stripeCustomerId
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

    if (!dbUser || !dbUser.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Create Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
