import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';

export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  qrId: uuid('qr_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  fieldsSchema: jsonb('fields_schema').notNull(),
  successMessage: text('success_message'),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Form = typeof forms.$inferSelect;
export type NewForm = typeof forms.$inferInsert;

export const formSubmissions = pgTable('form_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull(),
  submissionData: jsonb('submission_data'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  ipHash: text('ip_hash'),
});

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type NewFormSubmission = typeof formSubmissions.$inferInsert;