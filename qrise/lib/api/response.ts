import { NextResponse } from 'next/server'

/**
 * Standard API Error Codes
 */
export const ApiErrorCode = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  MISSING_API_KEY: 'MISSING_API_KEY',
  INVALID_API_KEY: 'INVALID_API_KEY',
  REVOKED_API_KEY: 'REVOKED_API_KEY',
  EXPIRED_API_KEY: 'EXPIRED_API_KEY',
  INSUFFICIENT_SCOPE: 'INSUFFICIENT_SCOPE',
  IP_NOT_ALLOWED: 'IP_NOT_ALLOWED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  API_KEY_NOT_FOUND: 'API_KEY_NOT_FOUND',
  WEBHOOK_NOT_FOUND: 'WEBHOOK_NOT_FOUND',

  // Rate Limiting & Quota
  RATE_LIMITED: 'RATE_LIMITED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  PLAN_LIMIT_EXCEEDED: 'PLAN_LIMIT_EXCEEDED',

  // Validation & Input
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  TYPE_NOT_FOUND: 'TYPE_NOT_FOUND',
  QR_NOT_FOUND: 'QR_NOT_FOUND',
  RESOLVER_NOT_CONFIGURED: 'RESOLVER_NOT_CONFIGURED',
  CONFLICT: 'CONFLICT',
  TYPE_IN_USE: 'TYPE_IN_USE',

  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

export type ApiErrorCode = typeof ApiErrorCode[keyof typeof ApiErrorCode]

export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  usage?: {
    calls_this_month: number
    calls_limit: number
    resets_at: string
  }
}

/**
 * Standard Success Response Envelope
 */
export function apiSuccess<T>(data: T, meta?: ApiMeta) {
  return NextResponse.json({
    ok: true,
    data,
    meta,
  })
}

/**
 * Standard Error Response Envelope
 */
export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details: details || {},
      },
    },
    { status }
  )
}
