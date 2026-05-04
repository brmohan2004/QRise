import { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { DemoDashboard } from "@/components/landing/demo-dashboard";
import { FeaturesSection } from "@/components/landing/features-section";
import { WhyQRise } from "@/components/landing/why-qrise";
import { ReviewsCarousel } from "@/components/landing/reviews-carousel";
import { MarketplaceSection } from "@/components/landing/marketplace-section";
import { DeveloperSection } from "@/components/landing/developer-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "QRise | Free Dynamic QR Code Generator with Analytics & Tracking",
  description: "Create free dynamic QR codes, multiple action menus, and password protected links. Track every scan with a powerful analytics dashboard. Edit destinations anytime without reprinting. Includes custom design studio, form builder, and REST API.",
  keywords: [
    "free QR code generator",
    "dynamic QR code",
    "multiple action QR",
    "password protected QR",
    "QR code tracker",
    "QR code analytics",
    "custom QR code design",
    "QR code maker online",
    "trackable QR code",
    "editable QR code",
    "QR code for marketing",
    "create QR code free",
  ],
  alternates: {
    canonical: "https://qrise.app",
  },
  openGraph: {
    title: "QRise | Free Dynamic QR Codes with Deep Analytics",
    description: "The all-in-one platform for professional QR code management. Create, track, and manage dynamic QR codes for free.",
    url: "https://qrise.app",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "QRise Dynamic QR Codes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QRise - Advanced Dynamic QR Code Management",
    description: "Track scans, update URLs anytime, and build custom QR experiences with QRise. Start for free.",
    images: ["/og-image.png"],
  },
};

const homeFAQs = [
  {
    question: "What is a dynamic QR code?",
    answer: "A dynamic QR code allows you to change the destination URL after it has been printed. Unlike static QR codes, you can update where the code points without reprinting physical materials. QRise makes creating and managing dynamic QR codes simple and free.",
  },
  {
    question: "Is QRise free to use?",
    answer: "Yes! QRise offers a free tier that includes dynamic QR code creation, basic analytics, and scan tracking. You can upgrade to Pro or Enterprise plans for advanced features like bulk generation, API access, and custom design tools.",
  },
  {
    question: "How do I track QR code scans?",
    answer: "QRise automatically tracks every scan of your dynamic QR codes. View detailed analytics including scan count, device type, geographic location, time of scan, and referral source directly from your QRise dashboard.",
  },
  {
    question: "Can I customize the design of my QR code?",
    answer: "Absolutely! QRise's Design Studio lets you customize colors, add your logo, choose corner styles, and apply frames to match your brand. Create professional QR codes that stand out.",
  },
  {
    question: "Does QRise offer an API for QR code generation?",
    answer: "Yes, QRise provides a full REST API with live and sandbox environments, HMAC-signed webhooks, and granular API key scopes. Generate and manage QR codes programmatically for seamless integration with your applications.",
  },
];

export default async function LandingPage() {
  const pricingEnabled = await isFeatureEnabled("pricing_page_enabled");

  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://qrise.app" },
      ]} />
      <FAQSchema faqs={homeFAQs} />
      <Hero />
      <TrustedBy />
      <DemoDashboard />
      <FeaturesSection />
      <WhyQRise />
      <MarketplaceSection />
      <DeveloperSection />
      <ReviewsCarousel />

      {/* FAQ Section for SEO */}
      <section className="py-20 px-4 bg-gray-50" aria-label="Frequently Asked Questions" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12 tracking-tight text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {homeFAQs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 text-lg font-bold text-gray-900 select-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter pricingEnabled={pricingEnabled} />
    </>
  );
}