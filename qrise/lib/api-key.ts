import crypto from 'crypto';

const SALT = process.env.API_KEY_HASH_SALT || '';

/**
 * Generate a new API key
 */
export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = 'qr_live_' + crypto.randomBytes(24).toString('hex');
  const prefix = raw.slice(0, 12);
  const hash = hashApiKey(raw);
  return { raw, prefix, hash };
}

/**
 * Hash an API key using HMAC-SHA256 with the secret salt
 */
export function hashApiKey(raw: string): string {
  if (SALT) {
    return crypto.createHmac('sha256', SALT).update(raw).digest('hex');
  }
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Verify an API key against a stored hash (constant-time comparison)
 */
export async function verifyApiKey(raw: string, storedHash: string): Promise<boolean> {
  const hash = hashApiKey(raw);
  try {
    if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash))) {
      return true;
    }
  } catch {}

  // Fallback check against unsalted legacy hash
  try {
    const legacyHash = crypto.createHash('sha256').update(raw).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(legacyHash), Buffer.from(storedHash));
  } catch {
    return false;
  }
}