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

const memoryCache = new Map<string, { flag: FeatureFlag | null; expiry: number }>();

/**
 * Checks if a global feature flag is enabled.
 * Optionally checks if it's enabled for a specific plan.
 */
export async function isFeatureEnabled(
  flagKey: string,
  planName?: string
): Promise<boolean> {
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

  try {
    const now = Date.now();
    const memCached = memoryCache.get(flagKey);
    if (memCached && memCached.expiry > now) {
      const flag = memCached.flag;
      if (!flag) return DEFAULT_FLAGS[flagKey] ?? false;
      if (!flag.isEnabled) return false;
      if (planName && flag.enabledForPlans && flag.enabledForPlans.length > 0) {
        return flag.enabledForPlans.includes(planName.toLowerCase());
      }
      return true;
    }

    const cacheKey = `ff:${flagKey}`;
    let flag: FeatureFlag | null = null;
    try {
      flag = (await redis.get(cacheKey)) as FeatureFlag | null;
    } catch {
      // Redis error fallback
    }

    if (!flag) {
      const dbPromise = db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.key, flagKey))
        .limit(1);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Feature flag query timed out (1s)')), 1000)
      );

      const [result] = (await Promise.race([dbPromise, timeoutPromise])) as FeatureFlag[];
      flag = result || null;
      
      if (flag) {
        redis.set(cacheKey, flag, { ex: 300 }).catch(() => {});
      }
    }

    memoryCache.set(flagKey, { flag, expiry: now + 300000 }); // 5 min in-memory cache

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
