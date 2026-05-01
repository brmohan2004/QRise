import { pgTable, uuid, varchar, text, boolean, jsonb, timestamp, index, bigint, integer } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { users } from './users';

export const customQrTypes = pgTable(
  'custom_qr_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 80 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    iconUrl: text('icon_url'),
    fieldsSchema: jsonb('fields_schema').notNull(),
    isPublic: boolean('is_public').default(false),
    isVerified: boolean('is_verified').default(false),
    isSuspended: boolean('is_suspended').default(false),
    suspendReason: text('suspend_reason'),
    scanCount: bigint('scan_count', { mode: 'bigint' }).default(0n),
    version: integer('version').default(1),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    idxPublicVerified: index('idx_custom_types_public').on(table.isPublic, table.isVerified).where(
      eq(table.isPublic, true)
    ),
  })
);

export type CustomQrType = typeof customQrTypes.$inferSelect;
export type NewCustomQrType = typeof customQrTypes.$inferInsert;
