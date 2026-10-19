import { TypeSelector } from "@/components/qr/wizard/type-selector";
import { WizardShell } from "@/components/qr/wizard/wizard-shell";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  // Fetch all feature flags in parallel instead of 7 sequential round-trips
  const [
    password,
    multiAction,
    bulk,
    smartRouting,
    designStudio,
    static_qr,
    dynamic_qr,
  ] = await Promise.all([
    isFeatureEnabled("password_qr_enabled"),
    isFeatureEnabled("multi_action_qr"),
    isFeatureEnabled("bulk_qr_enabled"),
    isFeatureEnabled("smart_routing_enabled"),
    isFeatureEnabled("design_studio"),
    isFeatureEnabled("static_qr"),
    isFeatureEnabled("dynamic_qr"),
  ]);

  const flags = {
    password,
    multiAction,
    bulk,
    smartRouting,
    designStudio,
    static_qr,
    dynamic_qr,
  };

  return (
    <WizardShell currentStep={1} showPreview={false}>
      <TypeSelector enabledFlags={flags} />
    </WizardShell>
  );
}