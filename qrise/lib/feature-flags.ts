import 'server-only';
import { db } from '@/lib/db';
import { featureFlags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Checks if a global feature flag is enabled.
 * Optionally checks if it's enabled for a specific plan.
 */
export async function isFeatureEnabled(
  flagKey: string,
  planName?: string
): Promise<boolean> {
  try {
    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, flagKey))
      .limit(1);

    if (!flag) return true; // Default to true if flag doesn't exist
    
    if (!flag.isEnabled) return false;

    if (planName && flag.enabledForPlans && flag.enabledForPlans.length > 0) {
      return flag.enabledForPlans.includes(planName.toLowerCase());
    }

    return true;
  } catch (error) {
    console.error(`Error checking feature flag "${flagKey}":`, error);
    // Fallback to true in case of DB error so the site doesn't crash
    return true;
  }
}
