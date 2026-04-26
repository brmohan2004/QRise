import { isFeatureEnabled } from "@/lib/feature-flags";
import PublicLayoutClient from "./public-layout-client";

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pricingEnabled = await isFeatureEnabled("pricing_page_enabled");

  return (
    <PublicLayoutClient pricingEnabled={pricingEnabled}>
      {children}
    </PublicLayoutClient>
  );
}
