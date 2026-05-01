import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

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
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedByAdminId: uuid('updated_by_admin_id'),
});

export type PlanRateLimit = typeof planRateLimits.$inferSelect;
export type NewPlanRateLimit = typeof planRateLimits.$inferInsert;
