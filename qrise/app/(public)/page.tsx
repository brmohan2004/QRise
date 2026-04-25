import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { DemoDashboard } from "@/components/landing/demo-dashboard";
import { FeaturesSection } from "@/components/landing/features-section";
import { WhyQRise } from "@/components/landing/why-qrise";
import { ReviewsCarousel } from "@/components/landing/reviews-carousel";
import { SiteFooter } from "@/components/landing/site-footer";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <DemoDashboard />
      <FeaturesSection />
      <WhyQRise />
      <ReviewsCarousel />
      <SiteFooter />
    </>
  );
}