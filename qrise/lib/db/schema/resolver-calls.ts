import { pgTable, uuid, jsonb, integer, timestamp, index, varchar, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { typeResolvers } from './type-resolvers';
import { qrCodes } from './qr-codes';

export const resolverCalls = pgTable('resolver_calls', {
  id: uuid('id').primaryKey().defaultRandom(),
  resolverId: uuid('resolver_id').notNull().references(() => typeResolvers.id, { onDelete: 'cascade' }),
  qrId: uuid('qr_id').references(() => qrCodes.id, { onDelete: 'cascade' }),
  scanContext: jsonb('scan_context').notNull(),
  resolverStatus: integer('resolver_status'),
  resolverLatencyMs: integer('resolver_latency_ms'),
  responseType: varchar('response_type', { length: 20 }),
  fallbackUsed: boolean('fallback_used').default(false),
  isTest: boolean('is_test').default(false),
  calledAt: timestamp('called_at').defaultNow(),
}, (table) => ({
  idxResolverCallsResolver: index('idx_resolver_calls_resolver').on(table.resolverId, table.calledAt),
  idxResolverCallsErrors: index('idx_resolver_calls_errors')
    .on(table.resolverId, table.calledAt)
    .where(sql`resolver_status >= 400 OR resolver_status IS NULL`),
}));

export type ResolverCall = typeof resolverCalls.$inferSelect;
export type NewResolverCall = typeof resolverCalls.$inferInsert;
