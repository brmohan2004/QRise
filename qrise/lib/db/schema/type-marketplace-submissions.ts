import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { customQrTypes } from './custom-qr-types';
import { users } from './users';

export const typeMarketplaceSubmissions = pgTable('type_marketplace_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  typeId: uuid('type_id').notNull().references(() => customQrTypes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  notes: text('notes'),
  reviewedBy: uuid('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type TypeMarketplaceSubmission = typeof typeMarketplaceSubmissions.$inferSelect;
export type NewTypeMarketplaceSubmission = typeof typeMarketplaceSubmissions.$inferInsert;
