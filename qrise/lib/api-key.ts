import crypto from 'crypto';

/**
 * Generate a new API key
 */
export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = 'qr_live_' + crypto.randomBytes(24).toString('hex');
  const prefix = raw.slice(0, 12);
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, prefix, hash };
}

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Verify an API key against a stored hash (constant-time comparison)
 */
export async function verifyApiKey(raw: string, storedHash: string): Promise<boolean> {
  const hash = hashApiKey(raw);
  // Constant-time comparison
  if (hash.length !== storedHash.length) return false;
  let result = 0;
  for (let i = 0; i < hash.length; i++) {
    result |= hash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}