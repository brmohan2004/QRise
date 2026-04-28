import { isFeatureEnabled } from "@/lib/feature-flags";
import { AnalyticsClient } from "./analytics-client";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalyticsPage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise;
  
  const analyticsEnabled = await isFeatureEnabled("analytics_dashboard_enabled");
  if (!analyticsEnabled) {
    redirect(`/qr-codes/${params.id}`);
  }

  const exportEnabled = await isFeatureEnabled("analytics_export_enabled");
  
  return (
    <AnalyticsClient id={params.id} exportEnabled={exportEnabled} />
  );
}
