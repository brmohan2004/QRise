import { pgTable, uuid, text, integer, boolean, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const usageAlertChannels = pgTable('usage_alert_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  channelType: varchar('channel_type', { length: 20 }).notNull(), // 'slack', 'discord', 'email'
  webhookUrl: text('webhook_url'),           // For Slack/Discord
  email: text('email'),                       // For email channel
  thresholdPct: integer('threshold_pct').default(80), // Alert when usage hits this % (50–100)
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export type UsageAlertChannel = typeof usageAlertChannels.$inferSelect;
export type NewUsageAlertChannel = typeof usageAlertChannels.$inferInsert;
