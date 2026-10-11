"use client";

import { useEffect, useState } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Check, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { QRPreview } from "../qr-preview";
import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { TypeBanner } from "./type-banner";
import { ChangeTypeDialog } from "./change-type-dialog";
import Link from "next/link";
import type { QRType } from "@/types/qr.types";

interface WizardShellProps {
  children: React.ReactNode;
  showPreview?: boolean;
  currentStep?: 1 | 2 | 3;
}

const steps = [
  { id: 1, name: "Type" },
  { id: 2, name: "Configure" },
  { id: 3, name: "Design" },
];

export function WizardShell({
  children,
  showPreview = true,
  currentStep,
}: WizardShellProps) {
  const router = useRouter();
  const { step, config, qrType, design, name, editingQrId, isDynamic, loadQR, setStep, setSaveStatus } = useWizardStore();
  const activeStep = currentStep || step || 1;

  const [isLoading, setIsLoading] = useState(false);
  const [isChangeTypeOpen, setIsChangeTypeOpen] = useState(false);

  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { data: usage } = useUsageStats();
  const isLimitReached =
    !!usage &&
    usage.metrics.dynamicQrs.limit !== -1 &&
    usage.metrics.dynamicQrs.current >= usage.metrics.dynamicQrs.limit &&
    !editingQrId;

  // Sync currentStep to store
  useEffect(() => {
    if (currentStep && currentStep !== step) {
      setStep(currentStep);
    }
  }, [currentStep, step, setStep]);

  useEffect(() => {
    async function fetchQR() {
      if (editId && editId !== editingQrId) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/qr/${editId}`);
          if (res.ok) {
            const json = await res.json();
            loadQR(json.data);
          }
        } catch (error) {
          console.error("Failed to fetch QR for editing:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchQR();
  }, [editId, editingQrId, loadQR]);

  // Debounced auto-save to backend API when editing an existing QR code
  useEffect(() => {
    if (!editingQrId || activeStep === 1) return;

    const timer = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        const res = await fetch(`/api/qr/${editingQrId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            type: qrType,
            targetUrl: (config as any)?.targetUrl || (config as any)?.defaultUrl,
            destinationType: (config as any)?.destinationType || "url",
            isDynamic,
            design,
            rules: (config as any)?.rules,
            actions: (config as any)?.actions,
            config,
          }),
        });

        if (res.ok) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveStatus("error");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [name, config, design, isDynamic, editingQrId, activeStep, qrType, setSaveStatus]);

  // Determine preview data based on config
  const getPreviewData = () => {
    if (!qrType) return "https://qrise.com";

    // If it's a dynamic QR, it should point to our redirect service
    if (isDynamic) {
      const shortCode = (config as any)?.shortCode || editingQrId || "preview-code";
      const origin = typeof window !== "undefined" ? window.location.origin : "https://qrise.com";
      return `${origin}/s/${shortCode}`;
    }

    // Static QRs point directly to destination
    if (qrType === "url") return (config as any)?.targetUrl || "https://qrise.com";
    if (qrType === "smart_routing") return (config as any)?.defaultUrl || "https://qrise.com";

    return "https://qrise.com/preview";
  };

  const handleStepClick = (sId: number) => {
    if (sId === 1) {
      // In stage 2 or 3, clicking Step 1 opens the Change Type modal
      if (activeStep > 1) {
        setIsChangeTypeOpen(true);
      } else {
        router.push("/create");
      }
    } else if (sId === 2) {
      if (activeStep === 3) {
        router.push(`/create/${qrType || "url"}`);
      }
    } else if (sId === 3) {
      if (activeStep === 2) {
        router.push(`/create/design?type=${qrType || "url"}`);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-300">
      <div className="flex-1 min-w-0 pb-28 sm:pb-0">
        {/* Minimalist Segmented Stepper */}
        <div className="mb-6 sm:mb-8">
          <div className="p-1.5 bg-slate-100/90 dark:bg-slate-800/60 rounded-2xl flex items-center gap-1.5 border border-slate-200/70 dark:border-slate-800 max-w-xl mx-auto shadow-xs">
            {steps.map((s) => {
              const isCompleted = activeStep > s.id;
              const isCurrent = activeStep === s.id;
              const isClickable = isCompleted || (activeStep === 2 && s.id === 3);

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStepClick(s.id)}
                  disabled={!isClickable && !isCurrent}
                  className={cn(
                    "flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 outline-none select-none",
                    isCurrent
                      ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
                      : isCompleted
                      ? "text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:bg-white/60 dark:hover:bg-slate-900/40 cursor-pointer"
                      : "text-slate-400 dark:text-slate-600 cursor-default"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-colors",
                      isCurrent
                        ? "bg-emerald-600 text-white"
                        : isCompleted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    )}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.id}
                  </span>
                  <span className="truncate">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Card */}
        <div
          className={cn(
            "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-sm relative overflow-hidden",
            isLoading && "opacity-60"
          )}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px]">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          )}

          {/* Quota limit banner */}
          {isLimitReached && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-none">
                  Quota Reached
                </span>
                <span className="text-xs font-bold text-rose-500 mt-1">
                  You have reached the limit for dynamic QR codes on your current plan.
                </span>
              </div>
              <Link
                href="/billing"
                className="ml-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
              >
                Upgrade
              </Link>
            </div>
          )}

          {/* In Stage 2 and Stage 3: Display the Current Type Bar with Change Type option */}
          {activeStep > 1 && (
            <TypeBanner
              currentType={qrType}
              stage={activeStep === 2 ? 2 : 3}
            />
          )}

          {children}
        </div>

        {/* Change Type Dialog for Stepper clicking Step 1 */}
        <ChangeTypeDialog
          open={isChangeTypeOpen}
          onOpenChange={setIsChangeTypeOpen}
          currentType={qrType}
        />
      </div>

      {/* Live Preview Panel on Desktop */}
      {showPreview && activeStep > 1 && (
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-20 sm:top-24">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Live Preview
                  </h3>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Real-time Output
                  </p>
                </div>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>

              <QRPreview
                data={getPreviewData()}
                options={design as any}
                className="mx-auto"
                downloadName={name || "qr-code"}
              />

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Scan this live preview with any camera to test your configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Change Type Modal */}
      <ChangeTypeDialog
        open={isChangeTypeOpen}
        onOpenChange={setIsChangeTypeOpen}
        currentType={qrType}
      />
    </div>
  );
}
