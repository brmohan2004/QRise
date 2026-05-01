import { pgTable, uuid, text, boolean, integer, timestamp, bigint } from 'drizzle-orm/pg-core';
import { customQrTypes } from './custom-qr-types';

export const typeResolvers = pgTable('type_resolvers', {
  id: uuid('id').primaryKey().defaultRandom(),
  typeId: uuid('type_id').notNull().references(() => customQrTypes.id, { onDelete: 'cascade' }),
  resolverUrl: text('resolver_url').notNull(),
  resolverSecret: text('resolver_secret').notNull(),
  timeoutMs: integer('timeout_ms').default(3000),
  fallbackUrl: text('fallback_url'),
  fallbackHtml: text('fallback_html'),
  retryOnFail: boolean('retry_on_fail').default(true),
  isActive: boolean('is_active').default(true),
  totalCalls: bigint('total_calls', { mode: 'number' }).default(0),
  totalErrors: bigint('total_errors', { mode: 'number' }).default(0),
  avgLatencyMs: integer('avg_latency_ms').default(0),
  lastCalledAt: timestamp('last_called_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type TypeResolver = typeof typeResolvers.$inferSelect;
export type NewTypeResolver = typeof typeResolvers.$inferInsert;
