import { ArrowRight, ShoppingCart, Sparkles } from "lucide-react";
import Link from "next/link";
import { TypeCard } from "@/components/marketplace/type-card";
import "./marketplace-section.css";

// Sample types for preview
const PREVIEW_TYPES = [
  {
    id: "1",
    name: "Medical Tracker",
    slug: "medical",
    description: "Specialized patient tracking and health record access.",
    is_verified: true,
    scan_count: 12400,
    qr_count: 450,
    fields_schema: {},
    icon_url: null
  },
  {
    id: "2",
    name: "Event Check-in",
    slug: "events",
    description: "Fast-pass QR entry for large scale conferences.",
    is_verified: true,
    scan_count: 45000,
    qr_count: 1200,
    fields_schema: {},
    icon_url: null
  },
  {
    id: "3",
    name: "Asset Logistics",
    slug: "logistics",
    description: "Supply chain tracking with real-time inventory updates.",
    is_verified: true,
    scan_count: 89000,
    qr_count: 3400,
    fields_schema: {},
    icon_url: null
  }
];

export function MarketplaceSection() {
  return (
    <section className="marketplace-section" aria-label="Marketplace">
      <div className="marketplace-container">
        <div className="marketplace-header">
          <h2 className="marketplace-title">
            Custom QR Marketplace
          </h2>
          <p className="marketplace-subtitle">
            Choose from hundreds of verified QR templates built by the community for every possible industry and use case.
          </p>
        </div>

        <div className="marketplace-grid">
          {PREVIEW_TYPES.map(type => (
            <div key={type.id} className="marketplace-card-wrapper">
               <TypeCard type={type as any} isLoggedIn={false} />
            </div>
          ))}
        </div>

        <div className="marketplace-footer">
          <Link 
            href="/marketplace" 
            className="marketplace-cta"
          >
            Visit Marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
