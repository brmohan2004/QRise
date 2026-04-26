import { TypeSelector } from "@/components/qr/wizard/type-selector";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const dynamic = 'force-dynamic';

export default async function CreatePage() {
  const flags = {
    password: await isFeatureEnabled("password_qr_enabled"),
    multiAction: await isFeatureEnabled("multi_action_qr_enabled"),
    bulk: await isFeatureEnabled("bulk_qr_enabled"),
    smartRouting: await isFeatureEnabled("smart_routing_enabled"),
    designStudio: await isFeatureEnabled("design_studio_enabled"),
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <TypeSelector enabledFlags={flags} />
    </div>
  );
}