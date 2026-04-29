import { isFeatureEnabled } from "@/lib/feature-flags";
import { PricingContent } from "@/components/pricing/pricing-content";
import { PricingComingSoon } from "@/components/pricing/pricing-coming-soon";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const isEnabled = await isFeatureEnabled("pricing_page_enabled");

  if (!isEnabled) {
    return <PricingComingSoon />;
  }

  const supabase = await createClient();
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .eq('is_publicly_visible', true)
    .order('price_monthly', { ascending: true });

  return <PricingContent initialPlans={plans || []} />;
}