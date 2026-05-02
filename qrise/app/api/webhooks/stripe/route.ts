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

  // Handle events synchronously to ensure completion before returning 200
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
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
            amountCents: session.amount_total || 0,
            currency: session.currency || 'usd',
            plan,
            status: 'succeeded',
            stripeCustomerId: session.customer as string,
            metadata: session.metadata,
          }).onConflictDoNothing({ target: billingEvents.stripeEventId });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
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
            }).onConflictDoNothing({ target: billingEvents.stripeEventId });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
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
              // @ts-ignore
              failureReason: invoice.last_finalization_error?.message || 'Payment failed',
            }).onConflictDoNothing({ target: billingEvents.stripeEventId });

            // B5: Send dunning email via Resend
            try {
              const { resend } = await import('@/lib/resend');
              await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'noreply@qrise.com',
                to: user.email,
                subject: 'Action Required: Your QRise Payment Failed',
                html: `<p>Hi there,</p><p>We couldn't process your latest payment for QRise. Please update your billing information to avoid service interruption.</p><p>Thanks,<br/>The QRise Team</p>`
              });
              console.log(`Dunning email sent to ${user.email}`);
            } catch (emailErr) {
              console.error(`Failed to send dunning email to ${user.email}`, emailErr);
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
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
              amountCents: 0, // B3 fix
              currency: 'usd', // B3 fix
              status: 'cancelled',
              stripeCustomerId: customerId,
            }).onConflictDoNothing({ target: billingEvents.stripeEventId });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Sync plan if it changed in Stripe
        if (customerId) {
          const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
          if (user) {
            let planName = user.plan;
            
            // Basic mapping, assuming metadata or known price IDs would map to plans
            // Using metadata if available from the subscription, else keeping existing
            if (subscription.metadata?.plan) {
              planName = subscription.metadata.plan;
            }

            await db.update(users)
              .set({
                plan: planName,
                billingStatus: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'past_due'
              })
              .where(eq(users.id, user.id));
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (dbErr) {
    console.error('Error updating database from webhook:', dbErr);
    // Don't throw, let it return 500 or 200 depending on strategy
    // In Stripe, returning 500 means it will retry
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
