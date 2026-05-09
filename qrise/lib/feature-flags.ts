import 'server-only';
import { db } from '@/lib/db';
import { featureFlags } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redis } from '@/lib/redis';

interface FeatureFlag {
  key: string;
  isEnabled: boolean;
  enabledForPlans: string[] | null;
}

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
    const cachedFlag = await redis.get(cacheKey) as FeatureFlag | null;
    let flag: FeatureFlag | null = null;

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

      const [result] = (await Promise.race([dbPromise, timeoutPromise])) as FeatureFlag[];
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
      'analytics_dashboard_enabled': true,
      'analytics_export_enabled': true,
      'pricing_page_enabled': true,
    };

    if (!flag) {
      return DEFAULT_FLAGS[flagKey] ?? false;
    }
    
    if (!flag.isEnabled) return false;

    if (planName && flag.enabledForPlans && flag.enabledForPlans.length > 0) {
      return flag.enabledForPlans.includes(planName.toLowerCase());
    }

    return true;
  } catch (error: any) {
    // Handle Next.js dynamic server usage error during static generation
    if (error.digest === 'DYNAMIC_SERVER_USAGE' || 
        error.message?.includes('Dynamic server usage') ||
        error.message?.includes('no-store fetch')) {
      // Return default flags during static generation to avoid build-time errors
      const DEFAULT_FLAGS: Record<string, boolean> = {
        'multi_action_qr': true,
        'password_qr_enabled': true,
        'bulk_qr_enabled': true,
        'smart_routing_enabled': true,
        'design_studio': true,
        'static_qr': true,
        'dynamic_qr': true,
        'analytics_dashboard_enabled': true,
        'analytics_export_enabled': true,
        'pricing_page_enabled': true,
      };
      return DEFAULT_FLAGS[flagKey] ?? false;
    }

    // Log timeouts as warnings rather than errors to reduce terminal spam, since we fall back safely
    if (error.message?.includes('timed out')) {
      console.warn(`[Warning] Feature flag "${flagKey}" check timed out. Using default fallback.`);
    } else {
      console.error(`Error checking feature flag "${flagKey}":`, error.message || error);
    }
    
    // Fallback to default values in case of DB error or timeout
    const DEFAULT_FLAGS: Record<string, boolean> = {
      'multi_action_qr': true,
      'password_qr_enabled': true,
      'bulk_qr_enabled': true,
      'smart_routing_enabled': true,
      'design_studio': true,
      'static_qr': true,
      'dynamic_qr': true,
      'analytics_dashboard_enabled': true,
      'analytics_export_enabled': true,
      'pricing_page_enabled': true,
    };
    
    return DEFAULT_FLAGS[flagKey] ?? false;
  }
}
