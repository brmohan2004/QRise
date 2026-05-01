import { pgTable, text, timestamp, uuid, jsonb, integer } from 'drizzle-orm/pg-core';

export const routingRules = pgTable('routing_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  qrId: uuid('qr_id').notNull(),
  priority: integer('priority').default(0),
  conditions: jsonb('conditions').notNull(),
  targetUrl: text('target_url').notNull(),
  label: text('label'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type RoutingRule = typeof routingRules.$inferSelect;
export type NewRoutingRule = typeof routingRules.$inferInsert;
