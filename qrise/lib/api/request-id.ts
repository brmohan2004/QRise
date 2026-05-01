/**
 * Generates a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${crypto.randomUUID().replace(/-/g, '')}`
}
