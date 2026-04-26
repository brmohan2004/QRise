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
  const [flag] = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.key, flagKey))
    .limit(1);

  if (!flag) return true; // Default to true if flag doesn't exist? Or false? 
                         // For QRise, we'll assume true unless explicitly disabled.
  
  if (!flag.isEnabled) return false;

  if (planName && flag.enabledForPlans && flag.enabledForPlans.length > 0) {
    return flag.enabledForPlans.includes(planName.toLowerCase());
  }

  return true;
}
