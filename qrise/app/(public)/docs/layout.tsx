import { isFeatureEnabled } from "@/lib/feature-flags";
import { redirect } from "next/navigation";
import DocsLayoutClient from "./docs-layout-client";
import { DocsComingSoon } from "@/components/docs/docs-coming-soon";

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
