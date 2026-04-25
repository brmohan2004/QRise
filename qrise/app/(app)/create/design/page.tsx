"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { WizardShell } from "@/components/qr/wizard/wizard-shell";
import { StudioPanel } from "@/components/qr/design-studio/studio-panel";
import { ScannabilityScore } from "@/components/qr/design-studio/scannability-score";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

export default function DesignPage() {
  const { name, qrType, config, design, isDynamic, editingQrId, reset, tempPassword } = useWizardStore();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const isEditing = !!editingQrId;
      const url = isEditing ? `/api/qr/${editingQrId}` : "/api/qr";
      const method = isEditing ? "PUT" : "POST";

      const requestBody: any = {
        name,
        type: qrType,
        config,
        design,
      };
      // SECURITY: Include password only for password type QRs (not persisted to localStorage)
      if (qrType === "password" && tempPassword && !isEditing) {
        requestBody.password = tempPassword;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? "update" : "create"} QR code`);
      }

      // Invalidate queries to refresh the list without a page reload
      queryClient.invalidateQueries({ queryKey: ['qrcodes'] });

      toast.success(`QR Code ${isEditing ? "updated" : "created"} successfully!`);
      
      const resJson = await response.json();
      const createdQR = resJson.data;
      
      if (!isEditing) {
        reset();
      }
      
      // Static QRs and Bulk QRs don't have a single analytics page, so redirect to list
      if (!isDynamic || qrType === "bulk") {
        router.push("/qr-codes");
      } else {
        router.push(`/qr-codes/${createdQR.id}/analytics`);
      }
      
    } catch (e: any) {
      toast.error(e.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardShell>
      <div className="mb-6">
        <Link href={`/create/${qrType || "url"}`} className="text-sm text-[#0F6E56] hover:underline">
          ← Back to config
        </Link>
      </div>
      
      <StudioPanel />
      
      <div className="mt-8 border-t border-gray-200 pt-8">
        <ScannabilityScore onWarning={setWarning} />
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleFinish}
            disabled={isSubmitting || warning}
            className="px-6 py-2.5 bg-[#0F6E56] text-white rounded-lg font-medium hover:bg-[#0d5c48] disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Finish & create QR
          </button>
        </div>
      </div>
    </WizardShell>
  );
}
