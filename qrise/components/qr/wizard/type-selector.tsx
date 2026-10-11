"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { qrTypesList, QRTypeItem } from "./types-config";
import { Switch } from "@/components/ui/switch";
import type { QRType } from "@/types/qr.types";

export function TypeSelector({
  enabledFlags = {
    password: true,
    multiAction: true,
    bulk: true,
    smartRouting: true,
    designStudio: true,
    static_qr: true,
    dynamic_qr: true,
  },
}: {
  enabledFlags?: {
    password: boolean;
    multiAction: boolean;
    bulk: boolean;
    smartRouting: boolean;
    designStudio: boolean;
    static_qr: boolean;
    dynamic_qr: boolean;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");

  const { qrType, isDynamic, setType, setDynamic, setStep } = useWizardStore();
  const [selected, setSelected] = useState<QRType | null>(qrType || "url");

  // Synchronize store step to 1
  useEffect(() => {
    setStep(1);
  }, [setStep]);

  // Handle forcing dynamic/static based on flags
  useEffect(() => {
    if (enabledFlags.dynamic_qr && !enabledFlags.static_qr) {
      setDynamic(true);
    } else if (!enabledFlags.dynamic_qr && enabledFlags.static_qr) {
      setDynamic(false);
    }
  }, [enabledFlags.dynamic_qr, enabledFlags.static_qr, setDynamic]);

  const filteredTypes = qrTypesList.filter((item) => {
    if (item.type === "password") return enabledFlags.password;
    if (item.type === "multi_action") return enabledFlags.multiAction;
    if (item.type === "bulk") return enabledFlags.bulk;
    if (item.type === "smart_routing") return enabledFlags.smartRouting;
    return true;
  });

  const handleContinue = () => {
    if (selected) {
      setType(selected);
      const query = fromParam ? `?from=${encodeURIComponent(fromParam)}` : "";
      router.push(`/create/${selected}${query}`);
    }
  };

  const allDisabled = !enabledFlags.static_qr && !enabledFlags.dynamic_qr;

  if (allDisabled) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl">
        <h2 className="text-base font-bold text-red-900 dark:text-red-300">QR Generation Disabled</h2>
        <p className="text-xs text-red-700 dark:text-red-400 mt-1">
          QR code generation is currently disabled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Visual Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          Select QR Format
        </h2>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
          Stage 1
        </span>
      </div>

      {/* Visual Format Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTypes.map((item: QRTypeItem) => {
          const isSelected = selected === item.type;
          const Icon = item.icon;

          return (
            <button
              key={item.type}
              type="button"
              onClick={() => setSelected(item.type)}
              className={cn(
                "relative p-4 rounded-2xl border text-left transition-all duration-200 group active:scale-[0.98]",
                isSelected
                  ? "border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-600/20 shadow-xs"
                  : "border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
              )}
            >
              {/* Selected Indicator */}
              <div
                className={cn(
                  "absolute top-3.5 right-3.5 h-4.5 w-4.5 rounded-full flex items-center justify-center transition-all",
                  isSelected
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-transparent"
                )}
              >
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </div>

              {/* Visual Squircle Icon */}
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105",
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Title & Badge */}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Concise Visual Tagline */}
              <p className="text-xs text-muted-foreground font-medium truncate">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Floating Bottom Bar on Mobile / Inline on Desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-3 sm:static sm:bg-transparent sm:border-0 sm:p-0 space-y-2.5 sm:space-y-4 shadow-lg sm:shadow-none">
        {/* Dynamic vs Static Toggle */}
        {enabledFlags.dynamic_qr && enabledFlags.static_qr && (
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
                  {isDynamic ? "Editable target & scan analytics" : "Direct permanent link"}
                </p>
              </div>
            </div>

            <Switch
              id="dynamic"
              checked={isDynamic}
              onCheckedChange={setDynamic}
            />
          </div>
        )}

        {/* Configure QR CTA Button */}
        <div>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
          >
            <span>Configure QR</span>
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}