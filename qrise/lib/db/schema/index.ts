import { relations } from 'drizzle-orm';

// Users & Plans
import { users, plans, type User, type NewUser, type Plan, type NewPlan } from './users';

// QR Codes
import { qrCodes, qrRedirectHistory, type QRCode, type NewQRCode, type QRRedirectHistory, type NewQRRedirectHistory } from './qr-codes';
import { routingRules, type RoutingRule, type NewRoutingRule } from './routing-rules';
import { qrActions, type QRAction, type NewQRAction } from './qr-actions';
import { scanEvents, scanDailyRollups, type ScanEvent, type NewScanEvent, type ScanDailyRollup } from './analytics';

// Forms
import { forms, formSubmissions, type Form, type NewForm, type FormSubmission, type NewFormSubmission } from './forms';

// API
import { apiKeys, webhooks, webhookDeliveries, type ApiKey, type NewApiKey, type Webhook, type NewWebhook, type WebhookDelivery } from './api-keys';
import { apiUsageEvents, type ApiUsageEvent, type NewApiUsageEvent } from './api-usage-events';

// Bulk
import { bulkJobs, type BulkJob, type NewBulkJob } from './bulk-jobs';

// Feature flags
import { featureFlags, type FeatureFlag, type NewFeatureFlag } from './feature-flags';

// Notifications
import { notifications, userNotifications } from './notifications';

// Feedback
import { platformFeedback, platformFeedbackRelations, type PlatformFeedback, type NewPlatformFeedback } from './platform-feedback';

// Billing
import { billingEvents, type BillingEvent, type NewBillingEvent } from './billing';

// Admin
import { adminAuditLog, platformConfig, maintenanceWindows, announcements } from './admin';

// Marketing
import { competitions, competitionRegistrations } from './competitions';
import { coupons, couponRedemptions } from './marketing';

// Security
import { ipBlocks, rateLimitViolations } from './security';

// Features
import { featuresQuiz, abuseReports } from './features';

// NEW: Rate limits & custom types
import { planRateLimits, type PlanRateLimit, type NewPlanRateLimit } from './plan-rate-limits';
import { customQrTypes, type CustomQrType, type NewCustomQrType } from './custom-qr-types';
import { typeResolvers, type TypeResolver, type NewTypeResolver } from './type-resolvers';
import { resolverCalls, type ResolverCall, type NewResolverCall } from './resolver-calls';
import { typeTemplates, type TypeTemplate, type NewTypeTemplate } from './type-templates';
import { usageMonthlySnapshots, type UsageMonthlySnapshot, type NewUsageMonthlySnapshot } from './usage-monthly-snapshots';
import { typeMarketplaceSubmissions, type TypeMarketplaceSubmission, type NewTypeMarketplaceSubmission } from './type-marketplace-submissions';
import { userRateLimitOverrides, type UserRateLimitOverride, type NewUserRateLimitOverride } from './user-rate-limit-overrides';
import { usageAlertChannels, type UsageAlertChannel, type NewUsageAlertChannel } from './usage-alert-channels';

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  qrCodes: many(qrCodes),
  apiKeys: many(apiKeys),
  bulkJobs: many(bulkJobs),
  feedback: many(platformFeedback),
  billingEvents: many(billingEvents),
  customQrTypes: many(customQrTypes),
  usageAlertChannels: many(usageAlertChannels),
}));

export const usageAlertChannelsRelations = relations(usageAlertChannels, ({ one }) => ({
  user: one(users, { fields: [usageAlertChannels.userId], references: [users.id] }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  users: many(users),
}));

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  user: one(users, { fields: [qrCodes.userId], references: [users.id] }),
  routingRules: many(routingRules),
  qrActions: many(qrActions),
  scanEvents: many(scanEvents),
  bulkJob: one(bulkJobs, { fields: [qrCodes.bulkJobId], references: [bulkJobs.id] }),
  customType: one(customQrTypes, { fields: [qrCodes.customTypeId], references: [customQrTypes.id] }),
}));

export const customQrTypesRelations = relations(customQrTypes, ({ one, many }) => ({
  user: one(users, { fields: [customQrTypes.userId], references: [users.id] }),
  resolvers: many(typeResolvers),
  templates: many(typeTemplates),
}));

export const typeResolversRelations = relations(typeResolvers, ({ one }) => ({
  type: one(customQrTypes, { fields: [typeResolvers.typeId], references: [customQrTypes.id] }),
}));

export const typeTemplatesRelations = relations(typeTemplates, ({ one }) => ({
  type: one(customQrTypes, { fields: [typeTemplates.typeId], references: [customQrTypes.id] }),
}));

export const resolverCallsRelations = relations(resolverCalls, ({ one }) => ({
  resolver: one(typeResolvers, { fields: [resolverCalls.resolverId], references: [typeResolvers.id] }),
}));

export const usageMonthlySnapshotsRelations = relations(usageMonthlySnapshots, ({ one }) => ({
  user: one(users, { fields: [usageMonthlySnapshots.userId], references: [users.id] }),
}));

export const typeMarketplaceSubmissionsRelations = relations(typeMarketplaceSubmissions, ({ one }) => ({
  type: one(customQrTypes, { fields: [typeMarketplaceSubmissions.typeId], references: [customQrTypes.id] }),
  user: one(users, { fields: [typeMarketplaceSubmissions.userId], references: [users.id] }),
}));

export const userRateLimitOverridesRelations = relations(userRateLimitOverrides, ({ one }) => ({
  user: one(users, { fields: [userRateLimitOverrides.userId], references: [users.id] }),
}));

// Existing relations
export const routingRulesRelations = relations(routingRules, ({ one }) => ({
  qrCode: one(qrCodes, { fields: [routingRules.qrId], references: [qrCodes.id] }),
}));
export const qrActionsRelations = relations(qrActions, ({ one }) => ({
  qrCode: one(qrCodes, { fields: [qrActions.qrId], references: [qrCodes.id] }),
}));
export const scanEventsRelations = relations(scanEvents, ({ one }) => ({
  qrCode: one(qrCodes, { fields: [scanEvents.qrId], references: [qrCodes.id] }),
  matchedRule: one(routingRules, { fields: [scanEvents.matchedRuleId], references: [routingRules.id] }),
}));
export const formsRelations = relations(forms, ({ one, many }) => ({
  user: one(users, { fields: [forms.userId], references: [users.id] }),
  qrCode: one(qrCodes, { fields: [forms.qrId], references: [qrCodes.id] }),
  submissions: many(formSubmissions),
}));
export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  form: one(forms, { fields: [formSubmissions.formId], references: [forms.id] }),
}));
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));
export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  user: one(users, { fields: [webhooks.userId], references: [users.id] }),
  deliveries: many(webhookDeliveries),
}));
export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  webhook: one(webhooks, { fields: [webhookDeliveries.webhookId], references: [webhooks.id] }),
}));
export const bulkJobsRelations = relations(bulkJobs, ({ one }) => ({
  user: one(users, { fields: [bulkJobs.userId], references: [users.id] }),
}));

// Exports
export {
  users,
  plans,
  qrCodes,
  qrRedirectHistory,
  routingRules,
  qrActions,
  scanEvents,
  scanDailyRollups,
  forms,
  formSubmissions,
  apiKeys,
   webhooks,
   webhookDeliveries,
   apiUsageEvents,
   bulkJobs,
  featureFlags,
  notifications,
  userNotifications,
  platformFeedback,
  platformFeedbackRelations,
  billingEvents,
  // Admin & Features
  adminAuditLog,
  platformConfig,
  maintenanceWindows,
  announcements,
  competitions,
  competitionRegistrations,
  coupons,
  couponRedemptions,

  ipBlocks,
  rateLimitViolations,
  featuresQuiz,
  abuseReports,
  // New
  planRateLimits,
  customQrTypes,
  typeResolvers,
  resolverCalls,
  typeTemplates,
  usageMonthlySnapshots,
  typeMarketplaceSubmissions,
  userRateLimitOverrides,
  usageAlertChannels,
  //
  type User,
  type NewUser,
  type Plan,
  type NewPlan,
  type FeatureFlag,
  type NewFeatureFlag,
  type QRCode,
  type NewQRCode,
  type QRRedirectHistory,
  type NewQRRedirectHistory,
  type RoutingRule,
  type NewRoutingRule,
  type QRAction,
  type NewQRAction,
  type ScanEvent,
  type NewScanEvent,
  type ScanDailyRollup,
  type Form,
  type NewForm,
  type FormSubmission,
  type NewFormSubmission,
  type ApiKey,
  type NewApiKey,
  type Webhook,
  type NewWebhook,
  type WebhookDelivery,
  type BulkJob,
  type NewBulkJob,
  type PlatformFeedback,
  type NewPlatformFeedback,
   type BillingEvent,
   type NewBillingEvent,
   type ApiUsageEvent,
   type NewApiUsageEvent,
   // New types
  type PlanRateLimit,
  type NewPlanRateLimit,
  type CustomQrType,
  type NewCustomQrType,
  type TypeResolver,
  type NewTypeResolver,
  type ResolverCall,
  type NewResolverCall,
  type TypeTemplate,
  type NewTypeTemplate,
  type UsageMonthlySnapshot,
  type NewUsageMonthlySnapshot,
  type TypeMarketplaceSubmission,
  type NewTypeMarketplaceSubmission,
  type UserRateLimitOverride,
  type NewUserRateLimitOverride,
  type UsageAlertChannel,
  type NewUsageAlertChannel,
};
