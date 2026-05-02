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
    default: "QRise - Dynamic QR Code Generator with Analytics & Tracking",
    template: "%s | QRise",
  },
  description: "Create dynamic QR codes that track every scan. Edit destinations anytime without reprinting. Free QR code generator with powerful analytics, design studio, form builder, and API for modern teams.",
  keywords: [
    "QR code generator",
    "dynamic QR code",
    "QR code tracker",
    "QR analytics",
    "free QR code generator",
    "custom QR code",
    "QR code design",
    "QR form builder",
    "QR API",
    "bulk QR codes",
    "QR code maker",
    "trackable QR code",
    "editable QR code",
    "QR code scanner analytics",
    "smart QR code",
    "QR code for business",
    "QR code marketing",
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
  openGraph: {
    title: "QRise - Dynamic QR Code Generator with Analytics & Tracking",
    description: "Create dynamic QR codes that track every scan. Edit destinations anytime without reprinting. Free to start.",
    url: "https://qrise.app",
    siteName: "QRise",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://qrise.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "QRise - Dynamic QR Code Generator with Powerful Analytics Dashboard",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QRise - Dynamic QR Code Generator with Analytics",
    description: "Create dynamic QR codes that track every scan. Edit destinations anytime without reprinting. Free to start.",
    images: ["https://qrise.app/og-image.png"],
    creator: "@QRiseApp",
    site: "@QRiseApp",
  },
  metadataBase: new URL("https://qrise.app"),
  verification: {
    // Add your verification codes here:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    other: {
      "msvalidate.01": "", // Add Bing verification code
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <OrganizationSchema />
        <WebApplicationSchema />
        <SoftwareApplicationSchema />
        <HowToSchema />
        <ReviewSchema />
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
      </body>
    </html>
  );
}
