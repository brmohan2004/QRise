import { pgTable, uuid, varchar, text, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { customQrTypes } from './custom-qr-types';

export const typeTemplates = pgTable('type_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  typeId: uuid('type_id').notNull().references(() => customQrTypes.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 80 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  templateHtml: text('template_html').notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uqTypeSlug: uniqueIndex('uq_type_templates_type_slug').on(table.typeId, table.slug),
}));

export type TypeTemplate = typeof typeTemplates.$inferSelect;
export type NewTypeTemplate = typeof typeTemplates.$inferInsert;
