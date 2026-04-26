import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { DemoDashboard } from "@/components/landing/demo-dashboard";
import { FeaturesSection } from "@/components/landing/features-section";
import { WhyQRise } from "@/components/landing/why-qrise";
import { ReviewsCarousel } from "@/components/landing/reviews-carousel";
import { SiteFooter } from "@/components/landing/site-footer";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const pricingEnabled = await isFeatureEnabled("pricing_page_enabled");

  return (
    <>
      <Hero />
      <TrustedBy />
      <DemoDashboard />
      <FeaturesSection />
      <WhyQRise />
      <ReviewsCarousel />
      <SiteFooter pricingEnabled={pricingEnabled} />
    </>
  );
}