"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { WizardShell } from "@/components/qr/wizard/wizard-shell";
import { StudioPanel } from "@/components/qr/design-studio/studio-panel";
import { ScannabilityScore } from "@/components/qr/design-studio/scannability-score";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { AlertCircle } from "lucide-react";

export function DesignClient({ isEnabled }: { isEnabled: boolean }) {
  const { name, qrType, config, design, isDynamic, editingQrId, reset, tempPassword } = useWizardStore();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState(false);
  const { data: usage } = useUsageStats();

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
      
      // If design studio is disabled, reset design to default before sending
      if (!isEnabled) {
        requestBody.design = {
          color: "#000000",
          backgroundColor: "#ffffff",
          dotStyle: "square",
          eyeStyle: "square",
          eyeColor: "#000000"
        };
      }

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

      queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
      toast.success(`QR Code ${isEditing ? "updated" : "created"} successfully!`);
      
      const resJson = await response.json();
      const createdQR = resJson.data;
      
      if (!isEditing) {
        reset();
      }
      
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

  if (!isEnabled) {
    return (
      <WizardShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 text-gray-400 flex items-center justify-center rounded-full mb-6">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Design Studio Disabled</h2>
          <p className="text-gray-500 max-w-sm mb-8">
            The Design Studio is currently disabled. You can still create your QR code with the default styling.
          </p>
          <Button 
            onClick={handleFinish} 
            disabled={isSubmitting}
            className="bg-[#0F6E56] hover:bg-[#0d5c48] h-12 px-8 font-bold rounded-xl"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Finish & Create QR
          </Button>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell>
      <div className="mb-8">
        <Link 
          href={`/create/${qrType || "url"}`} 
          className="group inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-emerald-600 transition-all"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 group-hover:bg-emerald-50 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Back to configuration
        </Link>
      </div>
      
      <StudioPanel />
      
      <div className="mt-8 border-t border-gray-200 pt-8">
        <ScannabilityScore onWarning={setWarning} />
        
        {usage && usage.metrics.dynamicQrs.limit !== -1 && usage.metrics.dynamicQrs.current >= usage.metrics.dynamicQrs.limit && !editingQrId && (
          <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-rose-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none">Quota Reached</span>
              <span className="text-xs font-bold text-rose-500 mt-1">You have reached the limit for dynamic QR codes on your current plan.</span>
            </div>
            <Link 
              href="/billing" 
              className="ml-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
            >
              Upgrade
            </Link>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleFinish}
            disabled={isSubmitting || warning || (!!usage && usage.metrics.dynamicQrs.limit !== -1 && usage.metrics.dynamicQrs.current >= usage.metrics.dynamicQrs.limit && !editingQrId)}
            className="group relative h-12 px-8 flex items-center justify-center bg-gray-900 text-white rounded-xl font-bold overflow-hidden transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center gap-2">
                Complete & Create QR
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    </WizardShell>
  );
}
