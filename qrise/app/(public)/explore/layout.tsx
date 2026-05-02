import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "QR Code Templates & Marketplace - Verified QR Types",
  description: "Browse our curated collection of verified QR code templates. Industry-specific solutions, creative templates, and community-built QR types for events, healthcare, logistics, retail, and more.",
  keywords: [
    "QR code templates",
    "QR code types",
    "vCard QR code",
    "WiFi QR code",
    "social media QR code",
    "event QR code",
    "medical QR code",
    "logistics QR code",
    "app store QR code",
    "QR code marketplace",
  ],
  alternates: {
    canonical: "https://qrise.app/explore",
  },
  openGraph: {
    title: "QR Code Templates & Marketplace | QRise",
    description: "Browse verified QR types for every industry. Events, healthcare, logistics, and more.",
    url: "https://qrise.app/explore",
    type: "website",
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
