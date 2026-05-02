import { db } from '@/lib/db';
import { apiKeys, type ApiKey } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashApiKey } from '@/lib/api-key';

export interface APIKeyAuthResult {
  userId: string;
  scopes: string[];
}

export async function authenticateAPIKey(
  key: string
): Promise<APIKeyAuthResult | null> {
  if (!key.startsWith('qr_live_')) {
    return null;
  }
  
  const keyHash = await hashApiKey(key);
  
  const result = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);
  
  if (!result[0] || !result[0].isActive) {
    return null;
  }

  // Check if expired
  if (result[0].expiresAt && result[0].expiresAt < new Date()) {
    return null;
  }
  
  // Update last_used_at asynchronously
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, result[0].id))
    .execute()
    .catch(console.error);
  
  return {
    userId: result[0].userId,
    scopes: result[0].scopes as string[],
  };
}

export function hasScope(
  scopes: string[],
  required: string
): boolean {
  return scopes.includes(required);
}
