import { isFeatureEnabled } from "@/lib/feature-flags";
import { DesignClient } from "./design-client";

export const dynamic = 'force-dynamic';

export default async function DesignPage() {
  const isEnabled = await isFeatureEnabled("design_studio");
  
  return <DesignClient isEnabled={isEnabled} />;
}
