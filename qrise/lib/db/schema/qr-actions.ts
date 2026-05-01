import { pgTable, text, uuid, integer } from 'drizzle-orm/pg-core';

export const qrActions = pgTable('qr_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  qrId: uuid('qr_id').notNull(),
  label: text('label'),
  actionType: text('action_type').notNull(),
  actionValue: text('action_value'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
});

export type QRAction = typeof qrActions.$inferSelect;
export type NewQRAction = typeof qrActions.$inferInsert;
