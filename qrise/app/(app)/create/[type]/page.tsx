import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { WizardShell } from "@/components/qr/wizard/wizard-shell";
import { URLConfig } from "@/components/qr/wizard/url-config";
import { SmartRoutingConfig } from "@/components/qr/wizard/smart-routing-config";
import { PasswordConfig } from "@/components/qr/wizard/password-config";
import { MultiActionConfig } from "@/components/qr/wizard/multi-action-config";
import { BulkUpload } from "@/components/qr/wizard/bulk-upload";
import type { QRType } from "@/types/qr.types";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { Stage2Nav } from "@/components/qr/wizard/stage2-nav";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ type: string }>;
}

const validTypes: QRType[] = ["url", "smart_routing", "password", "multi_action", "bulk"];

export default async function CreateTypePage({ params }: PageProps) {
  const { type } = await params;
  
  if (!validTypes.includes(type as QRType)) {
    notFound();
  }

  // Feature Flag checks
  if (type === "password") {
    const isEnabled = await isFeatureEnabled("password_qr_enabled");
    if (!isEnabled) redirect("/create");
  }
  if (type === "multi_action") {
    const isEnabled = await isFeatureEnabled("multi_action_qr");
    if (!isEnabled) redirect("/create");
  }
  if (type === "bulk") {
    const isEnabled = await isFeatureEnabled("bulk_qr_enabled");
    if (!isEnabled) redirect("/create");
  }
  if (type === "smart_routing") {
    const isEnabled = await isFeatureEnabled("smart_routing_enabled");
    if (!isEnabled) redirect("/create");
  }

  const configComponents: Record<QRType, React.ReactNode> = {
    url: <URLConfig />,
    smart_routing: <SmartRoutingConfig />,
    password: <PasswordConfig />,
    multi_action: <MultiActionConfig />,
    bulk: <BulkUpload />,
  };

  const config = configComponents[type as QRType];

  return (
    <WizardShell currentStep={2} showPreview={type !== "bulk"}>
      <div className="space-y-6 pb-36 sm:pb-0">
        {config}

        {/* Stage 2 Bottom Navigation (Floatable fixed bar on mobile) */}
        <Stage2Nav type={type} />
      </div>
    </WizardShell>
  );
}