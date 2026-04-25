import { users, plans, type User, type NewUser, type Plan, type NewPlan } from './users';
import { qrCodes, qrRedirectHistory, type QRCode, type NewQRCode, type QRRedirectHistory, type NewQRRedirectHistory } from './qr-codes';
import { routingRules, type RoutingRule, type NewRoutingRule } from './routing-rules';
import { qrActions, type QRAction, type NewQRAction } from './qr-actions';
import { scanEvents, scanDailyRollups, type ScanEvent, type NewScanEvent, type ScanDailyRollup } from './analytics';
import { forms, formSubmissions, type Form, type NewForm, type FormSubmission, type NewFormSubmission } from './forms';
import { apiKeys, webhooks, webhookDeliveries, type ApiKey, type NewApiKey, type Webhook, type NewWebhook, type WebhookDelivery } from './api-keys';
import { bulkJobs, type BulkJob, type NewBulkJob } from './bulk-jobs';
import { relations } from 'drizzle-orm';

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
  qrCodes: many(qrCodes),
  apiKeys: many(apiKeys),
  bulkJobs: many(bulkJobs),
}));

// Plans relations
export const plansRelations = relations(plans, ({ many }) => ({
  users: many(users),
}));

// QR Codes relations
export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  user: one(users, {
    fields: [qrCodes.userId],
    references: [users.id],
  }),
  routingRules: many(routingRules),
  qrActions: many(qrActions),
  scanEvents: many(scanEvents),
  bulkJob: one(bulkJobs, {
    fields: [qrCodes.bulkJobId],
    references: [bulkJobs.id],
  }),
}));

// Routing Rules relations
export const routingRulesRelations = relations(routingRules, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [routingRules.qrId],
    references: [qrCodes.id],
  }),
}));

// QR Actions relations
export const qrActionsRelations = relations(qrActions, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [qrActions.qrId],
    references: [qrCodes.id],
  }),
}));

// Scan Events relations
export const scanEventsRelations = relations(scanEvents, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [scanEvents.qrId],
    references: [qrCodes.id],
  }),
  matchedRule: one(routingRules, {
    fields: [scanEvents.matchedRuleId],
    references: [routingRules.id],
  }),
}));

// Forms relations
export const formsRelations = relations(forms, ({ one, many }) => ({
  user: one(users, {
    fields: [forms.userId],
    references: [users.id],
  }),
  qrCode: one(qrCodes, {
    fields: [forms.qrId],
    references: [qrCodes.id],
  }),
  submissions: many(formSubmissions),
}));

// Form Submissions relations
export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  form: one(forms, {
    fields: [formSubmissions.formId],
    references: [forms.id],
  }),
}));

// API Keys relations
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

// Webhooks relations
export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
  }),
  deliveries: many(webhookDeliveries),
}));

// Webhook Deliveries relations
export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookDeliveries.webhookId],
    references: [webhooks.id],
  }),
}));

// Bulk Jobs relations
export const bulkJobsRelations = relations(bulkJobs, ({ one }) => ({
  user: one(users, {
    fields: [bulkJobs.userId],
    references: [users.id],
  }),
}));

// Export all schemas
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
  bulkJobs,
  type User,
  type NewUser,
  type Plan,
  type NewPlan,
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
};
