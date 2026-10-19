/**
 * Secure client IP extraction utility.
 * Prevents IP spoofing via crafted X-Forwarded-For headers.
 */
export function getClientIp(headersOrRequest: Headers | Request): string {
  const getHeader = (name: string): string | null => {
    if ('headers' in headersOrRequest && typeof (headersOrRequest as any).headers?.get === 'function') {
      return (headersOrRequest as Request).headers.get(name);
    }
    if (typeof (headersOrRequest as Headers).get === 'function') {
      return (headersOrRequest as Headers).get(name);
    }
    return null;
  };

  // 1. Cloudflare True Client IP (Tamper-proof if running behind Cloudflare)
  const cfIp = getHeader('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // 2. Vercel / Nginx Real IP
  const realIp = getHeader('x-real-ip');
  if (realIp) return realIp.trim();

  // 3. Rightmost IP in X-Forwarded-For chain (set by the immediate trusted reverse proxy)
  const xff = getHeader('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',');
    const rightmost = parts[parts.length - 1]?.trim();
    if (rightmost) return rightmost;
  }

  return '127.0.0.1';
}
