import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Pricing Plans - Free, Pro & Enterprise QR Code Plans",
  description: "Simple, transparent pricing for QRise. Start free with dynamic QR codes. Upgrade to Pro for advanced analytics and design tools, or Enterprise for API access, bulk generation, and custom integrations.",
  keywords: [
    "QR code pricing",
    "free QR code generator",
    "QR code plans",
    "enterprise QR code",
    "QR code subscription",
    "affordable QR code generator",
    "QR API pricing",
  ],
  alternates: {
    canonical: "https://qrise.app/pricing",
  },
  openGraph: {
    title: "Pricing | QRise - Simple, Transparent Plans",
    description: "Start free. Upgrade as you grow. Transparent pricing for individuals, startups, and enterprises.",
    url: "https://qrise.app/pricing",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
