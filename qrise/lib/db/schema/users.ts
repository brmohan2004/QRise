import { pgTable, text, timestamp, uuid, boolean, integer, numeric, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 200 }),
  avatarUrl: text('avatar_url'),
  plan: varchar('plan', { length: 20 }).notNull().default('free'),
  planExpiresAt: timestamp('plan_expires_at'),
  isSuspended: boolean('is_suspended').default(false),
  suspensionReason: text('suspension_reason'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }),
  billingStatus: varchar('billing_status', { length: 30 }).default('active'),
  trialEndsAt: timestamp('trial_ends_at'),
  nextBillingDate: timestamp('next_billing_date'),
  lifetimeValueCents: integer('lifetime_value_cents').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  priceMonthly: numeric('price_monthly', { precision: 10, scale: 2 }),
  priceAnnual: numeric('price_annual', { precision: 10, scale: 2 }),
  isPubliclyVisible: boolean('is_publicly_visible').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  // Feature flags (plan-level)
  hasAnalytics: boolean('has_analytics').default(false),
  hasApiAccess: boolean('has_api_access').default(false),
  hasBulkGenerator: boolean('has_bulk_generator').default(false),
  hasDesignStudio: boolean('has_design_studio').default(false),
  hasSmartRouting: boolean('has_smart_routing').default(false),
  hasPasswordQr: boolean('has_password_qr').default(false),
  hasMultiActionQr: boolean('has_multi_action_qr').default(false),
  hasAnalyticsExport: boolean('has_analytics_export').default(false),
  hasFormBuilder: boolean('has_form_builder').default(false),

  // Design Studio Sub-Feature Constraints
  designStudioColorLimit: integer('design_studio_color_limit'),
  designStudioDotPatternLimit: integer('design_studio_dot_pattern_limit'),
  designStudioLogoLimit: integer('design_studio_logo_limit'),
  designStudioFrameLimit: integer('design_studio_frame_limit'),
  designStudioEyeShapeLimit: integer('design_studio_eye_shape_limit'),
  designStudioEyeColorLimit: integer('design_studio_eye_color_limit'),
  designStudioFrameColorLimit: integer('design_studio_frame_color_limit'),
  designStudioStyleLimit: integer('design_studio_style_limit'),

  // Smart Routing Constraints
  smartRoutingRuleLimit: integer('smart_routing_rule_limit'),
  smartRoutingGeotargeting: boolean('smart_routing_geotargeting').default(false),
  smartRoutingDevicetargeting: boolean('smart_routing_devicetargeting').default(false),
  smartRoutingTimetargeting: boolean('smart_routing_timetargeting').default(false),

  // Feature Specific Limits
  passwordQrLimit: integer('password_qr_limit'),
  multiActionQrLimit: integer('multi_action_qr_limit'),
  actionLimit: integer('action_limit'),
  bulkQrLimit: integer('bulk_qr_limit'),
  bulkQrRowLimit: integer('bulk_qr_row_limit'),

  // API Access
  apiKeyLimit: integer('api_key_limit').default(0),
  apiCallLimit: integer('api_call_limit'),
  webhookLimit: integer('webhook_limit').default(0),
  customDomainApi: boolean('custom_domain_api').default(false),

  // General QR & Scan Limits
  qrLimit: integer('qr_limit').default(-1),
  dynamicQrLimit: integer('dynamic_qr_limit'),
  staticQrLimit: integer('static_qr_limit'),
  smartQrLimit: integer('smart_qr_limit'),
  monthlyScanLimit: integer('monthly_scan_limit').default(-1),
  smartQrScanLimit: integer('smart_qr_scan_limit'),

  // Form Builder Constraints
  formBuilderLimit: integer('form_builder_limit'),
  formFieldLimit: integer('form_field_limit'),
  formFileUploadLimit: integer('form_file_upload_limit'),
  formSubmissionLimit: integer('form_submission_limit'),

  // Export
  csvExportLimit: integer('csv_export_limit'),
  analyticsExportDays: integer('analytics_export_days').default(30),
});

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

// Relations are defined in central index.ts to avoid circular dependencies
