"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DynamicBadgeProps {
  isDynamic?: boolean;
  className?: string;
}

export function DynamicBadge({ isDynamic = true, className }: DynamicBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm",
              isDynamic
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-gray-50 text-gray-500 border-gray-100",
              className
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isDynamic ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-400"
              )}
            />
            {isDynamic ? "Dynamic" : "Static"}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">
            {isDynamic
              ? "Dynamic QRs let you change the destination URL without reprinting"
              : "Static QRs have fixed destinations"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
