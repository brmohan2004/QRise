export const WEBHOOK_EVENTS = [
  'qr.created',
  'qr.updated',
  'qr.deleted',
  'qr.scanned',
  'qr.scan_milestone',
  'type.registered',
  'type.updated',
  'type.suspended',
  'resolver.failed',
  'usage.threshold_reached',
  'usage.quota_exceeded',
  'api_key.created',
  'api_key.revoked',
  'bulk.job_completed',
  'form.submission',
  'marketplace.submission_reviewed',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

export type WebhookEventData = {
  'qr.created': {
    qr_id: string;
    name: string;
    type: string;
    short_url: string;
    user_id: string;
  };
  'qr.updated': {
    qr_id: string;
    name: string;
    changed_fields: string[];
    user_id: string;
  };
  'qr.deleted': {
    qr_id: string;
    user_id: string;
  };
  'qr.scanned': {
    qr_id: string;
    scan_id: string;
    timestamp: string;
    ip: string;
    country: string;
    user_agent: string;
  };
  'qr.scan_milestone': {
    qr_id: string;
    milestone: number; // 100, 1000, 10000
    total_scans: number;
  };
  'type.registered': {
    type_slug: string;
    type_id: string;
    user_id: string;
    name: string;
  };
  'type.updated': {
    type_slug: string;
    type_id: string;
    user_id: string;
    changes: string[];
  };
  'type.suspended': {
    type_slug: string;
    type_id: string;
    user_id: string;
    reason: string;
  };
  'resolver.failed': {
    resolver_id: string;
    type_slug: string;
    qr_id?: string;
    error: string;
    timeout_ms: number;
  };
  'usage.threshold_reached': {
    user_id: string;
    percentage: number;
    used: number;
    limit: number;
    resetAt: string;
  };
  'usage.quota_exceeded': {
    user_id: string;
    resource_type: string;
    limit: number;
  };
  'api_key.created': {
    api_key_id: string;
    user_id: string;
    name: string;
    environment: string;
  };
  'api_key.revoked': {
    api_key_id: string;
    user_id: string;
    reason?: string;
  };
  'bulk.job_completed': {
    job_id: string;
    user_id: string;
    total_qr: number;
    success_count: number;
    failed_count: number;
  };
  'form.submission': {
    form_id: string;
    qr_id: string;
    submission_id: string;
    user_id: string;
  };
  'marketplace.submission_reviewed': {
    type_slug: string;
    type_id: string;
    user_id: string;
    status: 'approved' | 'rejected';
    reviewed_by: string;
    notes?: string;
  };
};

export type WebhookPayload<T extends WebhookEventType> = {
  id: string;
  type: T;
  created_at: string;
  api_version: string;
  data: WebhookEventData[T];
};
