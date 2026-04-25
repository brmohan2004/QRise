import { pgTable, text, timestamp, uuid, boolean, jsonb, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const qrCodes = pgTable('qr_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  shortCode: varchar('short_code', { length: 10 }).notNull().unique(),
  targetUrl: text('target_url'),
  isDynamic: boolean('is_dynamic').default(true),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  passwordHash: varchar('password_hash', { length: 60 }),
  designConfig: jsonb('design_config').$type<{ logoUrl?: string; logoPublicId?: string }>(),
  bulkJobId: uuid('bulk_job_id'),
  scanCount: integer('scan_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type QRCode = typeof qrCodes.$inferSelect;
export type NewQRCode = typeof qrCodes.$inferInsert;

export const qrRedirectHistory = pgTable('qr_redirect_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  qrId: uuid('qr_id').notNull().references(() => qrCodes.id, { onDelete: 'cascade' }),
  oldUrl: text('old_url'),
  newUrl: text('new_url'),
  changedBy: uuid('changed_by'),
  changedAt: timestamp('changed_at').defaultNow(),
});

export type QRRedirectHistory = typeof qrRedirectHistory.$inferSelect;
export type NewQRRedirectHistory = typeof qrRedirectHistory.$inferInsert;

const routingRules = {} as any;
const qrActions = {} as any;
const scanEvents = {} as any;
const bulkJobs = {} as any;

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  user: one(users, {
    fields: [qrCodes.userId],
    references: [users.id],
  }),
  routingRules: many(routingRules),
  qrActions: many(qrActions),
  scanEvents: many(scanEvents),
  bulkJob: one(bulkJobs, {
    fields: [qrCodes.bulkJobId],
    references: [bulkJobs.id],
  }),
}));
