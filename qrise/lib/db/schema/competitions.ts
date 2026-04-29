
import { pgTable, text, timestamp, uuid, boolean, jsonb, integer, varchar } from 'drizzle-orm/pg-core';

export const competitions = pgTable('competitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  prizeDetails: text('prize_details'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  registrationDeadline: timestamp('registration_deadline'),
  isPublic: boolean('is_public').default(false),
  isRegistrationOpen: boolean('is_registration_open').default(true),
  customPageHtml: text('custom_page_html'),
  customComponentsJson: jsonb('custom_components_json'),
  registrationFormSchema: jsonb('registration_form_schema'),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const competitionRegistrations = pgTable('competition_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  competitionId: uuid('competition_id').references(() => competitions.id),
  userId: uuid('user_id'),
  formData: jsonb('form_data').notNull(),
  email: varchar('email', { length: 300 }).notNull(),
  status: varchar('status', { length: 30 }).default('registered'),
  registeredAt: timestamp('registered_at').defaultNow(),
});
