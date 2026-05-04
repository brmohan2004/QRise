import featuresData from "@/data/before-auth/features.json";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { FeaturesQuizSection } from "./features-quiz-section";
import "./features.css";

const staticFeatures = featuresData.allFeatures.filter(f => !f.isNew);

// Extended feature descriptions for SEO content depth
const featureDetails: Record<string, string> = {
  "dynamic": "Make every QR type dynamic. Change where your QR code points at any time — either a URL or a custom formatted text display. No need to reprint physical materials — just update the content from your dashboard instantly.",
  "multi-action": "Create a landing page for your QR code that lets users choose from multiple actions like visiting a website, viewing important text, calling a number, sending an email, or finding a location on a map.",
  "password-protected": "Add a layer of security to your QR codes. Require scanners to enter a password before they can access the destination URL, perfect for sensitive information or exclusive content.",
  "smart-routing": "Automatically direct scanners to different destinations based on their device type (iOS vs Android), geographic location, or time of day. Perfect for location-specific promotions and app download links.",
  "analytics": "Get real-time visibility into every scan. Track device types, geographic locations, referral sources, scan times, and unique vs repeat scans with QRise's powerful analytics dashboard.",
  "design-studio": "Customize every aspect of your QR code appearance. Choose colors, add your company logo, select corner styles and dot patterns, and apply branded frames — all while maintaining scan reliability.",
  "form-builder": "Attach drag-and-drop forms directly to your QR codes. Collect contact information, feedback, registrations, and survey responses without needing a separate form tool.",
  "bulk-generator": "Upload a CSV file and generate hundreds or thousands of unique QR codes in minutes. Each code gets its own destination URL and analytics. Perfect for product packaging, event badges, and asset tracking.",
  "custom-types": "A powerful toolkit for developers. Define your own JSON schemas, build custom resolvers, and deploy unique QR types to our marketplace. Fully integrated with our API and webhook system.",
};

export default function FeaturesPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://qrise.app" },
        { name: "Features", url: "https://qrise.app/features" },
      ]} />
      <div className="features-section">
        <div className="features-container">
          {/* Header */}
          <header className="features-header">
            <h1 className="features-title">
              All Features
            </h1>
            <p className="features-description">
              Everything you need to create, track, and optimize your QR codes — from dynamic URLs and real-time analytics to a full design studio and developer API.
            </p>
          </header>

          {/* Current features grid */}
          <div className="features-grid">
            {staticFeatures.map((feature) => (
              <article
                key={feature.id}
                className="feature-card"
                data-feature={feature.id}
              >
                <h2 className="feature-card-title">
                  {feature.name}
                </h2>
                <p className="feature-card-description">{feature.description}</p>
                {featureDetails[feature.id] && (
                  <p className="feature-card-detail text-sm text-gray-500 mt-2 leading-relaxed">
                    {featureDetails[feature.id]}
                  </p>
                )}
              </article>
            ))}
          </div>

          {/* Upcoming features (interactive - client component) */}
          <FeaturesQuizSection />
        </div>
      </div>
    </>
  );
}