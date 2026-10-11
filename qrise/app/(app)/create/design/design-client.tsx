"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { WizardShell } from "@/components/qr/wizard/wizard-shell";
import { StudioPanel } from "@/components/qr/design-studio/studio-panel";
import { ScannabilityScore } from "@/components/qr/design-studio/scannability-score";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, Lock, AlertCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { Switch } from "@/components/ui/switch";

export function DesignClient({ isEnabled }: { isEnabled: boolean }) {
  const { name, qrType, config, design, isDynamic, setDynamic, editingQrId, reset, tempPassword } = useWizardStore();
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
      <WizardShell currentStep={3}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center rounded-3xl mb-6">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Design Studio Disabled</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-8">
            The Design Studio is currently disabled. You can still create your QR code with the default styling.
          </p>
          <Button 
            onClick={handleFinish} 
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 font-bold rounded-xl shadow-md shadow-emerald-600/20"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Finish & Create QR
          </Button>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell currentStep={3} showPreview={true}>
      <div className="space-y-6 pb-36 sm:pb-0">
        <StudioPanel />
        
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-8">
          <ScannabilityScore onWarning={setWarning} />
          
          {usage && usage.metrics.dynamicQrs.limit !== -1 && usage.metrics.dynamicQrs.current >= usage.metrics.dynamicQrs.limit && !editingQrId && (
            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-none">Quota Reached</span>
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

          {/* Stage 3 Bottom Navigation (Floatable fixed bar on mobile) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-3 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:mt-8 space-y-2.5 sm:space-y-4 shadow-lg sm:shadow-none">
            {/* Dynamic vs Static Toggle */}
            <div className="flex items-center justify-between p-2.5 sm:p-3.5 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      {isDynamic ? "Dynamic QR" : "Static QR"}
                    </span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {isDynamic ? "Editable" : "Static"}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate hidden xs:block sm:block">
                    {isDynamic ? "Editable target & scan analytics" : "Direct permanent destination"}
                  </p>
                </div>
              </div>

              <Switch
                id="stage3-dynamic-toggle"
                checked={isDynamic}
                onCheckedChange={setDynamic}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3">
              <Link 
                href={`/create/${qrType || "url"}`} 
                className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Configure QR</span>
              </Link>

              <button
                onClick={handleFinish}
                disabled={isSubmitting || warning || (!!usage && usage.metrics.dynamicQrs.limit !== -1 && usage.metrics.dynamicQrs.current >= usage.metrics.dynamicQrs.limit && !editingQrId)}
                className="group relative h-10 sm:h-11 px-6 sm:px-7 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider overflow-hidden shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Create QR</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
