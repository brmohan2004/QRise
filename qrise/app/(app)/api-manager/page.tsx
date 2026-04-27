import { FeatureGate } from "@/components/auth/feature-gate";
import ApiManagerClient from "./api-manager-client";

export const dynamic = 'force-dynamic';

export default function ApiManagerPage() {
  return (
    <FeatureGate 
      flag="api_access"
      title="API Access Disabled"
      description="The REST API and Webhooks management are currently disabled by the administrator."
    >
      <ApiManagerClient />
    </FeatureGate>
  );
}
