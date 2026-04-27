import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QRise - Dynamic QR Codes with Powerful Analytics",
  description: "Create dynamic QR codes that track every scan. Edit destinations anytime without reprinting. Powerful analytics, design tools, and integrations.",
  openGraph: {
    title: "QRise - Dynamic QR Codes with Powerful Analytics",
    description: "Create dynamic QR codes that track every scan. Edit destinations anytime without reprinting.",
    url: "https://qrise.app",
    siteName: "QRise",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QRise - Dynamic QR Codes with Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QRise - Dynamic QR Codes with Powerful Analytics",
    description: "Create dynamic QR codes that track every scan. Edit destinations anytime without reprinting.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://qrise.app"),
};

import { ImpersonateBanner } from "@/components/auth/impersonate-banner";
import { Toaster } from "sonner";

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
      <body className="min-h-full flex flex-col">
        <ImpersonateBanner />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
