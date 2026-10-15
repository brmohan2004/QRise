import React from "react";
import { 
  Package, 
  HeartPulse, 
  ShoppingCart, 
  Warehouse, 
  Factory, 
  Apple, 
  Ticket,
  CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IndustrySelectStepProps {
  selectedIndustry: string;
  onSelectIndustry: (industry: string) => void;
}

export const INDUSTRIES = [
  {
    id: "Postal & Tracking",
    name: "Postal & Tracking",
    icon: Package,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "Healthcare and Hospitals",
    name: "Healthcare and Hospitals",
    icon: HeartPulse,
    iconBg: "bg-purple-50 dark:bg-purple-950/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "Retail and Supermarkets",
    name: "Retail and Supermarkets",
    icon: ShoppingCart,
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "Logistics, Shipping and Warehousing",
    name: "Logistics, Shipping and Warehousing",
    icon: Warehouse,
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "Manufacturing and Automotive",
    name: "Manufacturing and Automotive",
    icon: Factory,
    iconBg: "bg-rose-50 dark:bg-rose-950/50",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "Food, Agriculture and Produce",
    name: "Food, Agriculture and Produce",
    icon: Apple,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "Entertainment and Events",
    name: "Entertainment and Events",
    icon: Ticket,
    iconBg: "bg-violet-50 dark:bg-violet-950/50",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
];

export function IndustrySelectStep({
  selectedIndustry,
  onSelectIndustry,
}: IndustrySelectStepProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          2. Choose an Industry
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select the industry for your project
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INDUSTRIES.map((ind) => {
          const Icon = ind.icon;
          const isSelected = selectedIndustry === ind.id;

          return (
            <button
              key={ind.id}
              type="button"
              onClick={() => onSelectIndustry(ind.id)}
              className={cn(
                "relative group flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98]",
                isSelected
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30 shadow-sm"
                  : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-200">
                  <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white dark:fill-emerald-500 dark:text-slate-950" />
                </div>
              )}

              {/* Icon Container */}
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform", ind.iconBg, ind.iconColor)}>
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>

              {/* Title */}
              <div className="min-w-0 pr-4">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {ind.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
