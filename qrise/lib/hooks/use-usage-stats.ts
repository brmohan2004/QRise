import { useQuery } from "@tanstack/react-query";

export interface UsageMetric {
  current: number;
  limit: number;
  pct: number;
  remaining: number;
}

export interface UsageStats {
  plan: {
    name: string;
    isPro: boolean;
    nextReset: string;
    daysToReset: number;
  };
  metrics: {
    scans: UsageMetric;
    dynamicQrs: UsageMetric;
    apiCalls: UsageMetric;
    customTypes: UsageMetric;
    forms: UsageMetric;
    submissions: UsageMetric;
    webhooks: UsageMetric;
  };
}

export function useUsageStats() {
  return useQuery<UsageStats>({
    queryKey: ["usage-stats-unified"],
    queryFn: async () => {
      // Fetch from the most comprehensive endpoint
      // We might need to fetch from multiple and merge, or create a new unified endpoint
      // For now, let's fetch from /api/user/usage as it has most dashboard stats
      const res = await fetch("/api/user/usage");
      const json = await res.json();
      const data = json.data;

      const nextResetDate = new Date();
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      nextResetDate.setDate(1);
      nextResetDate.setHours(0, 0, 0, 0);

      const daysToReset = Math.ceil((nextResetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      const getPct = (current: number, limit: number) => {
        if (!limit || limit === -1) return 0;
        return Math.min(100, Math.round((current / limit) * 100));
      };

      const getRemaining = (current: number, limit: number) => {
        if (limit === -1) return Infinity;
        return Math.max(0, limit - current);
      };

      return {
        plan: {
          name: data.plan.name,
          isPro: data.plan.name.toLowerCase() !== "free",
          nextReset: nextResetDate.toISOString(),
          daysToReset,
        },
        metrics: {
          scans: {
            current: data.usage.monthlyScans,
            limit: data.plan.limits.monthlyScans,
            pct: getPct(data.usage.monthlyScans, data.plan.limits.monthlyScans),
            remaining: getRemaining(data.usage.monthlyScans, data.plan.limits.monthlyScans),
          },
          dynamicQrs: {
            current: data.usage.dynamicQrs,
            limit: data.plan.limits.dynamicQrs,
            pct: getPct(data.usage.dynamicQrs, data.plan.limits.dynamicQrs),
            remaining: getRemaining(data.usage.dynamicQrs, data.plan.limits.dynamicQrs),
          },
          apiCalls: {
            current: data.usage.apiCalls,
            limit: data.plan.limits.apiCalls,
            pct: getPct(data.usage.apiCalls, data.plan.limits.apiCalls),
            remaining: getRemaining(data.usage.apiCalls, data.plan.limits.apiCalls),
          },
          customTypes: {
            current: data.usage.customTypes || 0, // Fallback if missing
            limit: data.plan.limits.customTypes || 0,
            pct: getPct(data.usage.customTypes || 0, data.plan.limits.customTypes || 0),
            remaining: getRemaining(data.usage.customTypes || 0, data.plan.limits.customTypes || 0),
          },
          forms: {
            current: data.usage.activeForms,
            limit: data.plan.limits.forms,
            pct: getPct(data.usage.activeForms, data.plan.limits.forms),
            remaining: getRemaining(data.usage.activeForms, data.plan.limits.forms),
          },
          submissions: {
            current: data.usage.formSubmissions,
            limit: data.plan.limits.formSubmissions,
            pct: getPct(data.usage.formSubmissions, data.plan.limits.formSubmissions),
            remaining: getRemaining(data.usage.formSubmissions, data.plan.limits.formSubmissions),
          },
          webhooks: {
            current: data.usage.webhooks,
            limit: data.plan.limits.webhooks,
            pct: getPct(data.usage.webhooks, data.plan.limits.webhooks),
            remaining: getRemaining(data.usage.webhooks, data.plan.limits.webhooks),
          }
        }
      };
    }
  });
}
