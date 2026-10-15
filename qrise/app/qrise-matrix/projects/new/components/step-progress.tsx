import React from "react";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep?: number;
}

const STEPS = [
  { step: 1, label: "Project Info" },
  { step: 2, label: "Industry" },
  { step: 3, label: "Template" },
];

export function StepProgress({ currentStep = 1 }: StepProgressProps) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative max-w-sm mx-auto px-4">
        {/* Connecting Lines */}
        <div className="absolute left-10 right-10 top-3.5 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />

        {STEPS.map((s) => {
          const isActive = currentStep >= s.step;
          const isCurrent = currentStep === s.step;

          return (
            <div key={s.step} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2",
                  isCurrent
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30"
                    : isActive
                    ? "bg-emerald-100 text-emerald-800 border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                )}
              >
                {s.step}
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold mt-1.5 whitespace-nowrap transition-colors",
                  isCurrent
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
