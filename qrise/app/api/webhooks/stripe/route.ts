import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users, billingEvents } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature') as string;

  let event: any;

  try {
    if (!endpointSecret) throw new Error('Stripe webhook secret is not set');
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Return 200 immediately to Stripe
  const response = NextResponse.json({ received: true });

  // Handle events asynchronously
  (async () => {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan || 'pro';

          if (userId) {
            await db.update(users)
              .set({
                plan: plan,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                billingStatus: 'active',
              })
              .where(eq(users.id, userId));

            await db.insert(billingEvents).values({
              userId,
              stripeEventId: event.id,
              eventType: event.type,
              amountCents: session.amount_total,
              currency: session.currency || 'usd',
              plan,
              status: 'succeeded',
              stripeCustomerId: session.customer as string,
              metadata: session.metadata,
            });
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as any;
          const customerId = invoice.customer as string;
          const amountPaid = invoice.amount_paid;

          if (customerId) {
            const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
            if (user) {
              await db.update(users)
                .set({
                  lifetimeValueCents: sql`${users.lifetimeValueCents} + ${amountPaid}`,
                  billingStatus: 'active',
                  nextBillingDate: invoice.next_payment_attempt 
                    ? new Date(invoice.next_payment_attempt * 1000) 
                    : undefined,
                })
                .where(eq(users.id, user.id));

              await db.insert(billingEvents).values({
                userId: user.id,
                stripeEventId: event.id,
                eventType: event.type,
                amountCents: amountPaid,
                currency: invoice.currency,
                status: 'succeeded',
                stripeInvoiceId: invoice.id,
                stripeCustomerId: customerId,
              });
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as any;
          const customerId = invoice.customer as string;

          if (customerId) {
            const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
            if (user) {
              await db.update(users)
                .set({ billingStatus: 'past_due' })
                .where(eq(users.id, user.id));

              await db.insert(billingEvents).values({
                userId: user.id,
                stripeEventId: event.id,
                eventType: event.type,
                amountCents: invoice.amount_due,
                currency: invoice.currency,
                status: 'failed',
                stripeInvoiceId: invoice.id,
                stripeCustomerId: customerId,
                failureReason: invoice.last_finalization_error?.message || 'Payment failed',
              });

              // TODO: Send dunning email via Resend
              console.log(`Payment failed for user ${user.email}`);
            }
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const customerId = subscription.customer as string;

          if (customerId) {
            const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
            if (user) {
              await db.update(users)
                .set({
                  plan: 'free',
                  billingStatus: 'cancelled',
                  stripeSubscriptionId: null,
                })
                .where(eq(users.id, user.id));

              await db.insert(billingEvents).values({
                userId: user.id,
                stripeEventId: event.id,
                eventType: event.type,
                status: 'cancelled',
                stripeCustomerId: customerId,
              });
            }
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const customerId = subscription.customer as string;
          // Sync plan if it changed in Stripe
          // This is a simplified version
          break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (dbErr) {
      console.error('Error updating database from webhook:', dbErr);
    }
  })();

  return response;
}
