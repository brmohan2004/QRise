
import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, decimal, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const adminAuditLog = pgTable('admin_audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: uuid('admin_user_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 50 }),
  targetId: uuid('target_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const platformConfig = pgTable('platform_config', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedBy: uuid('updated_by'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const maintenanceWindows = pgTable('maintenance_windows', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 300 }).notNull(),
  message: text('message').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at'),
  isActive: boolean('is_active').default(false),
  allowReadOnly: boolean('allow_read_only').default(true),
  affectedFeatures: text('affected_features').array(),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  message: text('message').notNull(),
  type: varchar('type', { length: 20 }).default('info'),
  linkText: varchar('link_text', { length: 100 }),
  linkUrl: varchar('link_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  showToPlans: text('show_to_plans').array(),
  startsAt: timestamp('starts_at').defaultNow(),
  endsAt: timestamp('ends_at'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
