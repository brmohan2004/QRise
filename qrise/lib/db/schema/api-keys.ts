import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: text('name'),
  keyPrefix: text('key_prefix'),
  keyHash: text('key_hash').notNull().unique(),
  scopes: text('scopes').array().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
  isActive: boolean('is_active').default(true),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  endpointUrl: text('endpoint_url').notNull(),
  events: text('events').array().notNull(),
  secretHash: text('secret_hash'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;

export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  webhookId: uuid('webhook_id').notNull(),
  eventType: text('event_type'),
  payload: jsonb('payload'),
  responseStatus: text('response_status'),
  deliveredAt: timestamp('delivered_at'),
  attempts: text('attempts').default('0'),
});

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;