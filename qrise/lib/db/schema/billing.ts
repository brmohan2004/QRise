import { pgTable, text, timestamp, uuid, varchar, integer, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const billingEvents = pgTable('billing_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  stripeEventId: varchar('stripe_event_id', { length: 100 }).unique(),
  eventType: varchar('event_type', { length: 100 }).notNull(), // 'payment_succeeded', 'payment_failed', 'subscription_cancelled'
  amountCents: integer('amount_cents'),
  currency: varchar('currency', { length: 10 }).default('usd'),
  plan: varchar('plan', { length: 50 }),
  status: varchar('status', { length: 30 }), // 'succeeded' | 'failed' | 'refunded'
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 100 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  failureReason: text('failure_reason'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type BillingEvent = typeof billingEvents.$inferSelect;
export type NewBillingEvent = typeof billingEvents.$inferInsert;
