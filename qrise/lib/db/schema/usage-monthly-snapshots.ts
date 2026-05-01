import { pgTable, uuid, date, integer, numeric, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

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
