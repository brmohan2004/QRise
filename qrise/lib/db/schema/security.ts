
import { pgTable, text, timestamp, uuid, boolean, jsonb, varchar } from 'drizzle-orm/pg-core';



export const ipBlocks = pgTable('ip_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  ipAddress: varchar('ip_address', { length: 45 }).notNull().unique(),
  reason: text('reason'),
  blockedAt: timestamp('blocked_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  isPermanent: boolean('is_permanent').default(false),
  metadata: jsonb('metadata'),
});

export const rateLimitViolations = pgTable('rate_limit_violations', {
  id: uuid('id').primaryKey().defaultRandom(),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  userId: uuid('user_id'),
  endpoint: text('endpoint'),
  violationType: varchar('violation_type', { length: 50 }), // 'minute' | 'hour' | 'day'
  violationDetails: jsonb('violation_details'),
  createdAt: timestamp('created_at').defaultNow(),
});
