"use client";

import { useEffect, useState } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { QRPreview } from "../qr-preview";
import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface WizardShellProps {
  children: React.ReactNode;
  showPreview?: boolean;
}

const steps = [
  { id: 1, name: "Select Type", href: "/create" },
  { id: 2, name: "Configure", href: "/create" },
  { id: 3, name: "Design", href: "/create/design" },
];

export function WizardShell({ children, showPreview = true }: WizardShellProps) {
  const { step, config, qrType, design, name, editingQrId, isDynamic, loadQR } = useWizardStore();
  const [showSaved, setShowSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { data: usage } = useUsageStats();
  const isLimitReached = !!usage && usage.metrics.dynamicQrs.limit !== -1 && usage.metrics.dynamicQrs.current >= usage.metrics.dynamicQrs.limit && !editingQrId;

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

  useEffect(() => {
    if (step > 1 && !editId) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [config, design, step, editId]);

  // Determine preview data based on config
  const getPreviewData = () => {
    if (!qrType) return "https://qrise.com";

    // If it's a dynamic QR, it should point to our redirect service
    if (isDynamic) {
      const shortCode = (config as any)?.shortCode || editingQrId || "preview-code";
      // Use a consistent origin for the preview
      const origin = typeof window !== 'undefined' ? window.location.origin : "https://qrise.com";
      return `${origin}/s/${shortCode}`;
    }

    // Static QRs point directly to the destination
    if (qrType === 'url') return (config as any)?.targetUrl || "https://qrise.com";
    if (qrType === 'smart_routing') return (config as any)?.defaultUrl || "https://qrise.com";
    
    // For other types, we might point to a specific internal landing page or just a placeholder
    return "https://qrise.com/preview";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="mb-6 sm:mb-8">
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-100 rounded-full mb-6 sm:mb-8 overflow-hidden">
            <div
              className="h-full bg-[#0F6E56] transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between px-2 sm:px-0 relative">
            {/* Background line for stepper */}
            <div className="absolute top-[18px] left-0 right-0 h-[2px] bg-gray-100 -z-10 mx-6 sm:mx-10" />
            
            {steps.map((s, index) => {
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              
              return (
                <div key={s.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={cn(
                      "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-500",
                      isCompleted
                        ? "bg-[#0F6E56] text-white"
                        : isCurrent
                        ? "bg-[#0F6E56] text-white ring-4 ring-[#0F6E56]/10 shadow-lg shadow-emerald-900/20"
                        : "bg-white text-gray-400 border-2 border-gray-100"
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : s.id}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors duration-300",
                      isCurrent ? "text-[#0F6E56]" : "text-gray-400",
                      "hidden xs:block" // Still hide on very small, but maybe show on most mobiles
                    )}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn("bg-white rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-sm relative overflow-hidden", isLoading && "opacity-60")}>
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0F6E56]" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/20 backdrop-blur-[1px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#0F6E56]" />
            </div>
          )}
          {isLimitReached && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
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
          {children}
        </div>

        <div className="h-6 mt-4 flex justify-center">
          {showSaved && (
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#0F6E56] animate-pulse">
              ✓ Progress Saved
            </p>
          )}
        </div>
      </div>

      {showPreview && step > 1 && (
        <div className="lg:w-80">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
              <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-tight flex items-center justify-between">
                Live Preview
                <span className="h-2 w-2 rounded-full bg-[#0F6E56] animate-ping" />
              </h3>
              
              <QRPreview 
                data={getPreviewData()} 
                options={design as any} 
                className="mx-auto"
                downloadName={name || "qr-code"}
              />
              
              <div className="mt-6 pt-6 border-t border-gray-100 italic text-center">
                <p className="text-[10px] text-gray-400">
                  Scanning this preview will simulate the final QR experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
