import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const platformFeedback = pgTable('platform_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  userEmail: varchar('user_email', { length: 255 }),
  type: varchar('type', { length: 50 }).notNull(), // 'bug', 'enhancement', 'suggestion', 'other'
  subject: varchar('subject', { length: 255 }).notNull(),
  content: text('content').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'reviewed', 'in-progress', 'resolved', 'closed'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type PlatformFeedback = typeof platformFeedback.$inferSelect;
export type NewPlatformFeedback = typeof platformFeedback.$inferInsert;

export const platformFeedbackRelations = relations(platformFeedback, ({ one }) => ({
  user: one(users, {
    fields: [platformFeedback.userId],
    references: [users.id],
  }),
}));
