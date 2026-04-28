import { pgTable, uuid, text, varchar, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').notNull(),
  type: varchar('type', { length: 20 }).default('email').notNull(),
  category: varchar('category', { length: 30 }).default('alert'),
  subject: varchar('subject', { length: 500 }),
  body: text('body').notNull(),
  targetType: varchar('target_type', { length: 30 }).default('all'),
  targetId: uuid('target_id'),
  targetPlan: varchar('target_plan', { length: 50 }),
  segment: jsonb('segment'),
  recipientCount: integer('recipient_count'),
  status: varchar('status', { length: 20 }).default('draft'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userNotifications = pgTable('user_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  notificationId: uuid('notification_id').notNull().references(() => notifications.id, { onDelete: 'cascade' }),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
