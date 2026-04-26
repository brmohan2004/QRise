import { FeatureGate } from "@/components/auth/feature-gate";
import FormsClient from "./forms-client";

export const dynamic = 'force-dynamic';

export default function FormsPage() {
  return (
    <FeatureGate 
      flag="form_builder_enabled"
      title="Form Builder Disabled"
      description="The Form Builder is currently disabled by the administrator."
    >
      <FormsClient />
    </FeatureGate>
  );
}
