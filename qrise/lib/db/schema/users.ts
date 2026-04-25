import { pgTable, text, timestamp, uuid, boolean, integer, numeric, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 200 }),
  avatarUrl: text('avatar_url'),
  plan: varchar('plan', { length: 20 }).notNull().default('free'),
  planExpiresAt: timestamp('plan_expires_at'),
  isSuspended: boolean('is_suspended').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  maxQrCodes: integer('max_qr_codes').notNull(),
  maxScansPerMonth: integer('max_scans_per_month').notNull(),
  hasAnalytics: boolean('has_analytics').default(false),
  hasApi: boolean('has_api').default(false),
  hasBulk: boolean('has_bulk').default(false),
  hasDesignStudio: boolean('has_design_studio').default(false),
  hasSmartRouting: boolean('has_smart_routing').default(false),
  priceMonthly: numeric('price_monthly', { precision: 10, scale: 2 }),
  priceAnnual: numeric('price_annual', { precision: 10, scale: 2 }),
});

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

// Relations are defined in central index.ts to avoid circular dependencies
