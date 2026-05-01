
import { pgTable, text, timestamp, uuid, boolean, integer, varchar } from 'drizzle-orm/pg-core';

export const featuresQuiz = pgTable('features_quiz', {
  id: uuid('id').primaryKey().defaultRandom(),
  featureName: varchar('feature_name', { length: 200 }).notNull(),
  hintText: text('hint_text').notNull(),
  answerHash: varchar('answer_hash', { length: 64 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  giftCode: varchar('gift_code', { length: 50 }),
  correctGuesses: integer('correct_guesses').default(0),
  isVisible: boolean('is_visible').default(false),
  isRevealed: boolean('is_revealed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const abuseReports = pgTable('abuse_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  qrId: uuid('qr_id'),
  reportedBy: uuid('reported_by'),
  reason: varchar('reason', { length: 200 }).notNull(),
  details: text('details'),
  status: varchar('status', { length: 20 }).default('pending'),
  reviewedBy: uuid('reviewed_by'),
  actionTaken: varchar('action_taken', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow(),
});
