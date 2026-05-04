import { isFeatureEnabled } from "@/lib/feature-flags";
import { redirect } from "next/navigation";
import DocsLayoutClient from "./docs-layout-client";
import { DocsComingSoon } from "@/components/docs/docs-coming-soon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation & API Reference",
  description: "Learn how to integrate QRise into your workflow. Explore our REST API, webhooks, custom QR types, and developer tools.",
  keywords: [
    "QRise documentation",
    "QR code API reference",
    "QR code webhooks",
    "developer tools for QR codes",
    "QRise SDK",
  ],
};

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isEnabled = await isFeatureEnabled("api_docs_enabled");

  if (!isEnabled) {
    return <DocsComingSoon />;
  }

  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
