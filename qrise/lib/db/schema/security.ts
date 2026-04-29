
import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, varchar } from 'drizzle-orm/pg-core';

export const rateLimitConfig = pgTable('rate_limit_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  planName: varchar('plan_name', { length: 50 }).notNull().unique(),
  requestsPerMinute: integer('requests_per_minute').notNull(),
  requestsPerHour: integer('requests_per_hour').notNull(),
  requestsPerDay: integer('requests_per_day').notNull(),
  autoBlockDurationMinutes: integer('auto_block_duration_minutes').default(60),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

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
