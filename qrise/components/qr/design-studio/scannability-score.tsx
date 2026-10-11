"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { calculateScannabilityScore } from "@/lib/scannability";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ScannabilityScore({ 
  onWarning,
  className 
}: { 
  onWarning?: (warn: boolean) => void;
  className?: string;
}) {
  const { design } = useWizardStore();
  const [score, setScore] = useState(100);

  useEffect(() => {
    const dotColor = design.dotColor || "#000000";
    const bgColor = design.bgColor || "#ffffff";
    const logoCoverage = design.logoUrl ? 20 : 0;
    const calculated = calculateScannabilityScore(dotColor, bgColor, logoCoverage);
    setScore(calculated);
    if (onWarning) {
      onWarning(calculated < 60);
    }
  }, [design, onWarning]);

  let statusColor = "text-emerald-600 dark:text-emerald-400";
  let statusBadge = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
  let barGradient = "bg-emerald-500";
  let Icon = CheckCircle2;
  let label = "High Scannability";
  let message = "Excellent contrast for fast camera detection.";

  if (score < 60) {
    statusColor = "text-rose-600 dark:text-rose-400";
    statusBadge = "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60";
    barGradient = "bg-rose-500";
    Icon = AlertCircle;
    label = "Low Scannability";
    message = "Low contrast or large logo. Increase contrast to ensure scanning.";
  } else if (score < 80) {
    statusColor = "text-amber-600 dark:text-amber-400";
    statusBadge = "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
    barGradient = "bg-amber-500";
    Icon = AlertTriangle;
    label = "Fair Scannability";
    message = "Acceptable contrast, but some phones may take longer to focus.";
  }

  return (
    <div className={cn("p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5 transition-all", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Scannability Score
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border", statusBadge)}>
            {score}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", barGradient)}
          style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
        />
      </div>

      <div className="flex items-start gap-1.5 pt-0.5">
        <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", statusColor)} />
        <div className="min-w-0">
          <p className={cn("text-xs font-bold leading-tight", statusColor)}>
            {label}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
