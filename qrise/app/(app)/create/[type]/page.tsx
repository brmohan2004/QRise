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
    <div className="">
      <WizardShell showPreview={type !== "bulk"}>
        <div className="mb-8">
          <Link 
            href="/create" 
            className="group inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-emerald-600 transition-all"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 group-hover:bg-emerald-50 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Back to type selection
          </Link>
        </div>
        {config}
        <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
          <Link
            href={`/create/design?type=${type}`}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100"
          >
            Next: Design Studio
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </WizardShell>
    </div>
  );
}