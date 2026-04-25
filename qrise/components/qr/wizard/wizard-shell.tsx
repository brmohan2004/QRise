"use client";

import { useEffect, useState } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { QRPreview } from "../qr-preview";

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
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto py-8 px-4">
      <div className="flex-1">
        <div className="mb-8">
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-[#0F6E56] transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            {steps.map((s, index) => {
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                        isCompleted
                          ? "bg-[#0F6E56] text-white"
                          : isCurrent
                          ? "bg-[#0F6E56] text-white ring-4 ring-[#0F6E56]/10"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                      )}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : s.id}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        isCurrent ? "text-[#0F6E56]" : "text-gray-400"
                      )}
                    >
                      {s.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="h-px w-12 sm:w-24 bg-gray-200 mx-2 -translate-y-3" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn("bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm relative", isLoading && "opacity-60")}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/20 backdrop-blur-[1px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#0F6E56]" />
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
