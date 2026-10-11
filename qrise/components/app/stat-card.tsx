"use client";

import { useEffect, useState } from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  delta?: string;
  deltaDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
  isLoading?: boolean;
  prefix?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaDirection = "neutral",
  icon: Icon,
  isLoading,
  prefix = ""
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (isLoading) return;
    
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const duration = 1000;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-xl" />
        </div>
        <Skeleton className="h-7 sm:h-8 w-24 rounded-lg" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </div>
    );
  }

  const formattedValue = typeof displayValue === 'number' 
    ? displayValue.toLocaleString() 
    : displayValue;

  return (
    <div className="group relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow transition-all duration-200">
      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
        <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
          {label}
        </span>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </div>
      
      <div className="space-y-1.5">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {prefix}{formattedValue}
        </h3>
        
        {delta && (
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-md",
              deltaDirection === "up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" :
              deltaDirection === "down" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" :
              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}>
              {deltaDirection === "up" && <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />}
              {deltaDirection === "down" && <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />}
              {deltaDirection === "neutral" && <Minus className="h-3 w-3 stroke-[2.5]" />}
              {delta}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
