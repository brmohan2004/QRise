import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { apiKeys } from './api-keys';
import { users } from './users';

export const apiUsageEvents = pgTable('api_usage_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  apiKeyId: uuid('api_key_id').notNull().references(() => apiKeys.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: varchar('endpoint', { length: 200 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: integer('status_code').notNull(),
  latencyMs: integer('latency_ms'),
  billableUnit: varchar('billable_unit', { length: 50 }),
  quantity: integer('quantity').default(1),
  environment: varchar('environment', { length: 10 }).default('live'),
  requestId: uuid('request_id').notNull(),
  calledAt: timestamp('called_at').defaultNow(),
}, (table) => ({
  idxUsageKeyMonth: index('idx_usage_key_month').on(table.apiKeyId, table.calledAt),
  idxUsageUserMonth: index('idx_usage_user_month').on(table.userId, table.calledAt),
  idxUsageEndpoint: index('idx_usage_endpoint').on(table.endpoint),
}));

export type ApiUsageEvent = typeof apiUsageEvents.$inferSelect;
export type NewApiUsageEvent = typeof apiUsageEvents.$inferInsert;
