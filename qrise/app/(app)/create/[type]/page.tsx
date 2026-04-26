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
    const isEnabled = await isFeatureEnabled("multi_action_qr_enabled");
    if (!isEnabled) redirect("/create");
  }
  if (type === "bulk") {
    const isEnabled = await isFeatureEnabled("bulk_qr_enabled");
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
    <div className="max-w-6xl mx-auto py-8 px-4">
      <WizardShell showPreview={type !== "bulk"}>
        <div className="mb-6">
          <Link href="/create" className="text-sm text-[#0F6E56] hover:underline">
            ← Back to type selection
          </Link>
        </div>
        {config}
        <div className="mt-6 flex justify-end">
          <Link
            href={`/create/design?type=${type}`}
            className="px-4 py-2 bg-[#0F6E56] text-white rounded-lg font-medium hover:bg-[#0d5c48]"
          >
            Next: Design Studio →
          </Link>
        </div>
      </WizardShell>
    </div>
  );
}