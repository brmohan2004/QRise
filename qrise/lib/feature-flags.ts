import 'server-only';
import { db } from '@/lib/db';
import { featureFlags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redis } from '@/lib/redis';

/**
 * Checks if a global feature flag is enabled.
 * Optionally checks if it's enabled for a specific plan.
 */
export async function isFeatureEnabled(
  flagKey: string,
  planName?: string
): Promise<boolean> {
  try {
    const cacheKey = `ff:${flagKey}`;
    const cachedFlag = await redis.get(cacheKey);
    let flag: any;

    if (cachedFlag) {
      flag = cachedFlag;
    } else {
      // Add a local timeout for the DB query to prevent hanging the request
      const dbPromise = db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.key, flagKey))
        .limit(1);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Feature flag query timed out (3s)')), 3000)
      );

      const [result] = (await Promise.race([dbPromise, timeoutPromise])) as any[];
      flag = result;
      
      if (flag) {
        await redis.set(cacheKey, flag, { ex: 60 });
      }
    }

    // Default values for common flags to ensure core functionality works
    const DEFAULT_FLAGS: Record<string, boolean> = {
      'multi_action_qr': true,
      'password_qr_enabled': true,
      'bulk_qr_enabled': true,
      'smart_routing_enabled': true,
      'design_studio': true,
      'static_qr': true,
      'dynamic_qr': true,
    };

    if (!flag) {
      return DEFAULT_FLAGS[flagKey] ?? false;
    }
    
    if (!flag.isEnabled) return false;

    if (planName && flag.enabledForPlans && flag.enabledForPlans.length > 0) {
      return flag.enabledForPlans.includes(planName.toLowerCase());
    }

    return true;
  } catch (error) {
    console.error(`Error checking feature flag "${flagKey}":`, error);
    
    // Fallback to default values in case of DB error or timeout
    const DEFAULT_FLAGS: Record<string, boolean> = {
      'multi_action_qr': true,
      'password_qr_enabled': true,
      'bulk_qr_enabled': true,
      'smart_routing_enabled': true,
      'design_studio': true,
      'static_qr': true,
      'dynamic_qr': true,
    };
    
    return DEFAULT_FLAGS[flagKey] ?? false;
  }
}
