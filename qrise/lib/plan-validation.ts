import { type Plan } from './db/schema';

export type PlanFeatureKey = 
  | 'hasAnalytics'
  | 'hasApiAccess'
  | 'hasBulkGenerator'
  | 'hasDesignStudio'
  | 'hasSmartRouting'
  | 'hasPasswordQr'
  | 'hasMultiActionQr'
  | 'hasAnalyticsExport'
  | 'hasFormBuilder';

export type LimitKey = 
  | 'qrLimit' 
  | 'dynamicQrLimit' 
  | 'staticQrLimit' 
  | 'monthlyScanLimit'
  | 'apiKeyLimit'
  | 'bulkQrLimit'
  | 'formBuilderLimit';

/**
 * Validates if a user's plan has access to a specific feature flag.
 */
export function validateFeatureAccess(
  userPlan: Plan,
  feature: PlanFeatureKey
): { allowed: boolean; reason?: string; upgradeUrl?: string } {
  if (!userPlan[feature]) {
    return { 
      allowed: false, 
      reason: `Your current plan (${userPlan.name}) doesn't include access to this feature.`,
      upgradeUrl: '/pricing'
    }
  }

  return { allowed: true }
}

/**
 * Validates if a user's current usage is within their plan's limits.
 */
export function validateLimit(
  userPlan: Plan,
  limitKey: LimitKey,
  currentUsage: number
): { allowed: boolean; reason?: string; upgradeUrl?: string } {
  const limit = userPlan[limitKey];
  
  if (limit === null) return { allowed: true };
  if (limit === -1) return { allowed: true }; // Unlimited

  if (currentUsage >= limit) {
    return {
      allowed: false,
      reason: `You've reached your ${limitKey.replace(/([A-Z])/g, ' $1').toLowerCase()} of ${limit}.`,
      upgradeUrl: '/pricing'
    }
  }

  return { allowed: true }
}
