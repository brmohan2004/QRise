import { pgTable, text, timestamp, uuid, varchar, integer, jsonb, date, numeric, uniqueIndex, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

// --- Billing Events ---
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

// --- Usage Snapshots ---
export const usageMonthlySnapshots = pgTable('usage_monthly_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  month: date('month').notNull(), // First day of month: 2026-04-01
  apiCalls: integer('api_calls').default(0),
  imageRenders: integer('image_renders').default(0),
  embedRenders: integer('embed_renders').default(0),
  resolverCalls: integer('resolver_calls').default(0),
  overageCalls: integer('overage_calls').default(0),
  overageUsd: numeric('overage_usd', { precision: 10, scale: 4 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uqUserMonth: uniqueIndex('uq_usage_snapshots_user_month').on(table.userId, table.month),
}));

export type UsageMonthlySnapshot = typeof usageMonthlySnapshots.$inferSelect;
export type NewUsageMonthlySnapshot = typeof usageMonthlySnapshots.$inferInsert;

// --- Plan Rate Limits ---
export const planRateLimits = pgTable('plan_rate_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  plan: varchar('plan', { length: 50 }).notNull().unique(),
  rpm: integer('rpm').notNull().default(20),
  rpd: integer('rpd').notNull().default(500),
  maxBurst: integer('max_burst').notNull().default(5),
  imageRendersPerMonth: integer('image_renders_per_month').notNull().default(100),
  embedRendersPerMonth: integer('embed_renders_per_month').notNull().default(500),
  resolverCallsPerMonth: integer('resolver_calls_per_month').notNull().default(0),
  apiCallsPerMonth: integer('api_calls_per_month').notNull().default(1000),
  maxWebhooks: integer('max_webhooks').notNull().default(2),
  maxCustomTypes: integer('max_custom_types').notNull().default(0),
  maxResolverTimeoutMs: integer('max_resolver_timeout_ms').notNull().default(3000),
  maxDynamicQrs: integer('max_dynamic_qrs').notNull().default(50),
  formBuilderLimit: integer('form_builder_limit').notNull().default(0),
  formSubmissionLimit: integer('form_submission_limit').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedByAdminId: uuid('updated_by_admin_id'),
});

export type PlanRateLimit = typeof planRateLimits.$inferSelect;
export type NewPlanRateLimit = typeof planRateLimits.$inferInsert;

// --- Usage Alert Channels ---
export const usageAlertChannels = pgTable('usage_alert_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  channelType: varchar('channel_type', { length: 20 }).notNull(), // 'slack', 'discord', 'email'
  webhookUrl: text('webhook_url'),           // For Slack/Discord
  email: text('email'),                       // For email channel
  thresholdPct: integer('threshold_pct').default(80), // Alert when usage hits this % (50–100)
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export type UsageAlertChannel = typeof usageAlertChannels.$inferSelect;
export type NewUsageAlertChannel = typeof usageAlertChannels.$inferInsert;

// --- User Rate Limit Overrides ---
export const userRateLimitOverrides = pgTable('user_rate_limit_overrides', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  override: jsonb('override').notNull(), // Partial<PlanRateLimits>
  reason: text('reason'),
  createdByAdminId: uuid('created_by_admin_id'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type UserRateLimitOverride = typeof userRateLimitOverrides.$inferSelect;
export type NewUserRateLimitOverride = typeof userRateLimitOverrides.$inferInsert;
