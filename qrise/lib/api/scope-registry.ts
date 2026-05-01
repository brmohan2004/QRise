export const SCOPES = {
  QR_READ:          'qr:read',
  QR_WRITE:         'qr:write',
  ANALYTICS_READ:   'analytics:read',
  FORMS_READ:       'forms:read',
  BULK_WRITE:       'bulk:write',
  TYPES_READ:       'types:read',
  TYPES_WRITE:      'types:write',
  WEBHOOKS_MANAGE:  'webhooks:manage',
  USAGE_READ:       'usage:read',
} as const

export type ApiScope = typeof SCOPES[keyof typeof SCOPES]

/**
 * Human-readable scope descriptions for UI
 */
export const SCOPE_LABELS: Record<ApiScope, string> = {
  'qr:read':        'Read QR codes and analytics',
  'qr:write':       'Create, update, and delete QR codes',
  'analytics:read': 'Read scan analytics',
  'forms:read':     'Read form definitions and submissions',
  'bulk:write':     'Create bulk QR jobs',
  'types:read':     'Read custom QR type definitions',
  'types:write':    'Create and manage custom QR types',
  'webhooks:manage':'Create and manage webhooks',
  'usage:read':     'Read usage and billing data',
}
