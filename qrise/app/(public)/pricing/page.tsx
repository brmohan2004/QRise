import { isFeatureEnabled } from "@/lib/feature-flags";
import { PricingContent } from "@/components/pricing/pricing-content";
import { PricingComingSoon } from "@/components/pricing/pricing-coming-soon";
import { db } from "@/lib/db";
import { plans as plansTable, planRateLimits } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const revalidate = 3600;

export default async function PricingPage() {
  const isEnabled = await isFeatureEnabled("pricing_page_enabled");

  if (!isEnabled) {
    return <PricingComingSoon />;
  }

  try {
    const rawPlans = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.isPubliclyVisible, true))
      .orderBy(asc(plansTable.priceMonthly));

    const allRateLimits = await db
      .select()
      .from(planRateLimits);

    // Map camelCase Drizzle results to snake_case for the component
    const plans = rawPlans.map(p => {
      const limits = allRateLimits.find(l => l.plan === p.name.toLowerCase()) || {};
      
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price_monthly: Number(p.priceMonthly),
        price_annual: Number(p.priceAnnual),
        is_publicly_visible: p.isPubliclyVisible,
        sort_order: p.sortOrder,
        has_analytics: p.hasAnalytics,
        has_api_access: p.hasApiAccess,
        has_bulk_generator: p.hasBulkGenerator,
        has_design_studio: p.hasDesignStudio,
        has_smart_routing: p.hasSmartRouting,
        has_password_qr: p.hasPasswordQr,
        has_multi_action_qr: p.hasMultiActionQr,
        has_analytics_export: p.hasAnalyticsExport,
        has_form_builder: p.hasFormBuilder,
        qr_limit: p.qrLimit,
        monthly_scan_limit: p.monthlyScanLimit,
        
        // Design Studio Constraints
        design_studio_color_limit: p.designStudioColorLimit,
        design_studio_logo_limit: p.designStudioLogoLimit,
        design_studio_style_limit: p.designStudioStyleLimit,
        design_studio_frame_limit: p.designStudioFrameLimit,
        
        // API & Webhooks
        api_key_limit: p.apiKeyLimit,
        api_call_limit: p.apiCallLimit,
        webhook_limit: p.webhookLimit,
        custom_domain_api: p.customDomainApi,
        
        // Technical Limits (from plan_rate_limits)
        rpm: (limits as any).rpm,
        rpd: (limits as any).rpd,
        max_burst: (limits as any).max_burst,
        image_renders_per_month: (limits as any).image_renders_per_month,
        api_calls_per_month: (limits as any).api_calls_per_month,
      };
    });

    console.log(`[PricingPage] Fetched and mapped ${plans.length} plans with rate limits.`);

    return <PricingContent initialPlans={plans} />;
  } catch (error) {
    console.error('Error fetching plans via Drizzle:', error);
    return <PricingContent initialPlans={[]} />;
  }
}