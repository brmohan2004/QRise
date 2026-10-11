import { TypeSelector } from "@/components/qr/wizard/type-selector";
import { WizardShell } from "@/components/qr/wizard/wizard-shell";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const flags = {
    password: await isFeatureEnabled("password_qr_enabled"),
    multiAction: await isFeatureEnabled("multi_action_qr"),
    bulk: await isFeatureEnabled("bulk_qr_enabled"),
    smartRouting: await isFeatureEnabled("smart_routing_enabled"),
    designStudio: await isFeatureEnabled("design_studio"),
    static_qr: await isFeatureEnabled("static_qr"),
    dynamic_qr: await isFeatureEnabled("dynamic_qr"),
  };

  return (
    <WizardShell currentStep={1} showPreview={false}>
      <TypeSelector enabledFlags={flags} />
    </WizardShell>
  );
}