import { isFeatureEnabled } from "@/lib/feature-flags";
import { redirect } from "next/navigation";
import DocsLayoutClient from "./docs-layout-client";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isEnabled = await isFeatureEnabled("api_docs_enabled");

  if (!isEnabled) {
    redirect("/");
  }

  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
