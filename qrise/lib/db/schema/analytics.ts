import { pgTable, text, timestamp, uuid, boolean, integer, date, index } from 'drizzle-orm/pg-core';

export const scanEvents = pgTable('scan_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  qrId: uuid('qr_id').notNull(),
  scannedAt: timestamp('scanned_at').defaultNow(),
  country: text('country'),
  city: text('city'),
  deviceType: text('device_type'),
  os: text('os'),
  browser: text('browser'),
  ipHash: text('ip_hash'),
  isBot: boolean('is_bot').default(false),
  isUnique: boolean('is_unique').default(true),
  matchedRuleId: uuid('matched_rule_id'),
}, (table) => ({
  qrIdIdx: index('idx_scan_qr_id').on(table.qrId),
  scannedAtIdx: index('idx_scan_scanned_at').on(table.scannedAt),
}));

export type ScanEvent = typeof scanEvents.$inferSelect;
export type NewScanEvent = typeof scanEvents.$inferInsert;

export const scanDailyRollups = pgTable('scan_daily_rollups', {
  qrId: uuid('qr_id').notNull(),
  date: date('date').notNull(),
  totalScans: integer('total_scans').default(0),
  uniqueScans: integer('unique_scans').default(0),
  botScans: integer('bot_scans').default(0),
});

export type ScanDailyRollup = typeof scanDailyRollups.$inferSelect;
