import { FeatureGate } from "@/components/auth/feature-gate";
import ApiManagerClient from "./api-manager-client";
import { ApiManagerHeader } from "./components/api-manager-header";

export const dynamic = 'force-dynamic';

export default function ApiManagerPage() {
  return (
    <div className="space-y-6">
      <ApiManagerHeader />
      <FeatureGate 
        flag="api_access"
        title="API Access Disabled"
        description="The REST API and Webhooks management are currently disabled by the administrator."
      >
        <ApiManagerClient />
      </FeatureGate>
    </div>
  );
}
