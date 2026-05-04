import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "QRise | Advanced Dynamic QR Code Generator & Analytics Platform",
    template: "%s | QRise",
  },
  description: "The professional choice for dynamic QR codes. Create, track, and manage QR codes with real-time analytics, smart routing, custom design studio, and secure password protection. Built for modern marketing and operations teams.",
  keywords: [
    "dynamic QR code generator",
    "QR code analytics platform",
    "trackable QR codes",
    "QR code marketing tracking",
    "smart QR code routing",
    "custom branded QR codes",
    "QR code management system",
    "bulk QR code generator",
    "QR code API for developers",
    "secure QR codes",
    "password protected QR code",
    "QR code form builder",
    "editable QR code destinations",
    "QR scan tracking",
    "enterprise QR code solution",
    "free dynamic QR codes",
    "QRise app",
  ],
  alternates: {
    canonical: "https://qrise.app",
  },
  applicationName: "QRise",
  authors: [{ name: "QRise Team", url: "https://qrise.app" }],
  creator: "QRise",
  publisher: "QRise",
  category: "Technology",
  classification: "Business Software",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://qrise.app"),
  openGraph: {
    title: "QRise - Advanced Dynamic QR Codes with Deep Analytics",
    description: "Scale your QR code strategy with dynamic destinations, real-time scan tracking, and a powerful design studio. Start for free today.",
    url: "/",
    siteName: "QRise",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QRise Platform - Dynamic QR Code Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QRise - The Professional Dynamic QR Code Platform",
    description: "Track every scan, route users smartly, and design branded QR codes that convert. The all-in-one QR solution.",
    images: ["/og-image.png"],
    creator: "@QRiseApp",
  },
  verification: {
    google: "G-XXXXXXXXXX", // Placeholder, user should update with real ID
    other: {
      "msvalidate.01": "XXXXXXXXXX", // Placeholder
    },
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "QRise",
  },
};

import { ImpersonateBanner } from "@/components/auth/impersonate-banner";
import { Toaster } from "sonner";
import { UsageLimitModal } from "@/components/billing/usage-limit-modal";

import { OrganizationSchema, WebApplicationSchema, SoftwareApplicationSchema, HowToSchema, ReviewSchema } from "@/components/seo/json-ld";

import { headers } from "next/headers";
import { QRScannerOverlay } from "@/components/scanner/qr-scanner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') || undefined;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <OrganizationSchema nonce={nonce} />
        <WebApplicationSchema nonce={nonce} />
        <SoftwareApplicationSchema nonce={nonce} />
        <HowToSchema nonce={nonce} />
        <ReviewSchema nonce={nonce} />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <ImpersonateBanner />
        {children}
        <Toaster position="top-center" richColors />
        <UsageLimitModal />
        <QRScannerOverlay />
      </body>
    </html>
  );
}
