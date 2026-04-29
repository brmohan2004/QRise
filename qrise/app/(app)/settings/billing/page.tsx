import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users, billingEvents, plans } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import BillingClient from '@/app/(app)/settings/billing/billing-client';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch user data
  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  
  // Fetch billing events
  const history = await db.select()
    .from(billingEvents)
    .where(eq(billingEvents.userId, user.id))
    .orderBy(desc(billingEvents.createdAt))
    .limit(10);

  // Fetch available plans (for upgrade options if needed)
  const allPlans = await db.select().from(plans).where(eq(plans.isPubliclyVisible, true));

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-zinc-400 text-lg">Manage your plan, payment methods, and view your billing history.</p>
      </div>

      <BillingClient 
        user={dbUser} 
        history={history} 
        plans={allPlans} 
      />
    </div>
  );
}
