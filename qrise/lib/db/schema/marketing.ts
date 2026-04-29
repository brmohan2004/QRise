
import { pgTable, text, timestamp, uuid, boolean, decimal, varchar, integer } from 'drizzle-orm/pg-core';

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 20 }).notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  appliesToPlans: text('applies_to_plans').array(),
  maxUses: integer('max_uses'),
  usesCount: integer('uses_count').default(0),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  isActive: boolean('is_active').default(true),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const couponRedemptions = pgTable('coupon_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  couponId: uuid('coupon_id').references(() => coupons.id),
  userId: uuid('user_id').notNull(),
  plan: varchar('plan', { length: 50 }),
  discountApplied: decimal('discount_applied', { precision: 10, scale: 2 }),
  redeemedAt: timestamp('redeemed_at').defaultNow(),
});
