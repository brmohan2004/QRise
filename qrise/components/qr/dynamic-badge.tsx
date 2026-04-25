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
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
              isDynamic
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600",
              className
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isDynamic ? "bg-green-500 animate-pulse" : "bg-gray-400"
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
