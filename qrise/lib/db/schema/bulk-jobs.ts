import { pgTable, text, timestamp, uuid, jsonb, integer } from 'drizzle-orm/pg-core';

export const bulkJobs = pgTable('bulk_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  status: text('status').notNull().default('queued'),
  totalRows: integer('total_rows').notNull(),
  processedRows: integer('processed_rows').default(0),
  zipUrl: text('zip_url'),
  zipFileKey: text('zip_file_key'),
  errorLog: jsonb('error_log'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type BulkJob = typeof bulkJobs.$inferSelect;
export type NewBulkJob = typeof bulkJobs.$inferInsert;