import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "All Features - Dynamic QR Codes, Analytics, Design Studio & API",
  description: "Explore all QRise features: dynamic QR codes, real-time scan analytics, custom design studio, drag-and-drop form builder, bulk QR generation, REST API, webhooks, and smart routing.",
  keywords: [
    "QR code features",
    "dynamic QR code generator features",
    "QR code analytics dashboard",
    "custom QR code design",
    "QR code API",
    "bulk QR code generator",
    "QR form builder",
    "smart QR routing",
    "QR webhook integration",
  ],
  alternates: {
    canonical: "https://qrise.app/features",
  },
  openGraph: {
    title: "All Features | QRise - Dynamic QR Code Platform",
    description: "Dynamic QR codes, real-time analytics, design studio, form builder, bulk generation, API access and more.",
    url: "https://qrise.app/features",
    type: "website",
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
