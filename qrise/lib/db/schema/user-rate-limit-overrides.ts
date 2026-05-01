import { pgTable, uuid, jsonb, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

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
