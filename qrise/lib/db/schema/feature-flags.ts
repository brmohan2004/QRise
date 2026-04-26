import { pgTable, text, timestamp, uuid, boolean, varchar } from 'drizzle-orm/pg-core';

export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  isEnabled: boolean('is_enabled').default(true),
  enabledForPlans: text('enabled_for_plans').array(), // Drizzle handles text[] as array
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;
