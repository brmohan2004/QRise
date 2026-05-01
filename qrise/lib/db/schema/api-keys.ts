import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, inet } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: text('name'),
  description: text('description'),
  keyPrefix: text('key_prefix'),
  keyHash: text('key_hash').notNull().unique(),
  scopes: text('scopes').array().notNull(),
  environment: text('environment', { enum: ['live', 'test'] }).default('live'),
  ipAllowlist: text('ip_allowlist').array(),
  expiresAt: timestamp('expires_at'),
  monthlyCallLimit: integer('monthly_call_limit'),
  callsThisMonth: integer('calls_this_month').default(0),
  callsResetAt: timestamp('calls_reset_at').default(sql`date_trunc('month', NOW()) + INTERVAL '1 month'`),
  lastIp: inet('last_ip'),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
  isActive: boolean('is_active').default(true),
  adminCallLimitOverride: jsonb('admin_call_limit_override'), // { minute, hour, day }
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  endpointUrl: text('endpoint_url').notNull(),
  events: text('events').array().notNull(),
  secret: text('secret'),
  filterConfig: jsonb('filter_config'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  webhookId: uuid('webhook_id').notNull(),
  eventType: text('event_type'),
  payload: jsonb('payload'),
  signature: text('signature'),
  responseStatus: text('response_status'),
  deliveredAt: timestamp('delivered_at'),
  attempts: integer('attempts').default(0),
  nextRetryAt: timestamp('next_retry_at'),
  durationMs: integer('duration_ms'),
  status: text('status', { enum: ['pending', 'delivered', 'failed', 'retrying', 'abandoned'] }).default('pending'),
  filterConfig: jsonb('filter_config'),
});

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveries.$inferInsert;