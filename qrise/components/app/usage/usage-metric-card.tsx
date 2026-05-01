"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UsageMetricCardProps {
  label: string;
  current: number;
  limit: number;
  pct: number;
  icon: LucideIcon;
  color: "emerald" | "amber" | "blue" | "indigo" | "rose";
  delay?: number;
}

const colorStyles = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    gradient: "from-emerald-400 to-emerald-600",
    shadow: "shadow-[0_0_12px_rgba(16,185,129,0.2)]",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    gradient: "from-amber-400 to-amber-600",
    shadow: "shadow-[0_0_12px_rgba(217,119,6,0.2)]",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    gradient: "from-blue-400 to-blue-600",
    shadow: "shadow-[0_0_12px_rgba(37,99,235,0.2)]",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    gradient: "from-indigo-400 to-indigo-600",
    shadow: "shadow-[0_0_12px_rgba(79,70,229,0.2)]",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    gradient: "from-rose-400 to-rose-600",
    shadow: "shadow-[0_0_12px_rgba(225,29,72,0.2)]",
  },
};

export function UsageMetricCard({ 
  label, 
  current, 
  limit, 
  pct, 
  icon: Icon, 
  color,
  delay = 0 
}: UsageMetricCardProps) {
  const style = colorStyles[color];
  const isInfinite = limit === -1 || limit === 0 && current > 0; // Simplified check for infinity

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[32px] border shadow-sm space-y-3 sm:space-y-5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-20 h-20 md:w-24 md:h-24" />
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] truncate mr-1">{label}</span>
        <div className={cn("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0", style.bg)}>
          <Icon className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4", style.text)} />
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex flex-wrap items-baseline gap-1">
          {new Intl.NumberFormat().format(current)}
          {limit !== -1 && (
            <span className="text-[10px] sm:text-sm md:text-base text-slate-300 font-medium">
              / {new Intl.NumberFormat().format(limit)}
            </span>
          )}
          {limit === -1 && (
            <span className="text-[10px] sm:text-sm md:text-base text-slate-300 font-medium">/ ∞</span>
          )}
        </p>
        
        <div className="h-1.5 md:h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            className={cn("h-full rounded-full transition-all duration-500", style.gradient, style.shadow)} 
          />
        </div>
      </div>
    </motion.div>
  );
}
