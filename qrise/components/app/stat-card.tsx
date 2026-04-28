"use client";

import { useEffect, useState } from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="overflow-hidden border-gray-100 rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="mt-3 h-4 w-16 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const formattedValue = typeof displayValue === 'number' 
    ? displayValue.toLocaleString() 
    : displayValue;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-gray-100 rounded-2xl group">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 line-clamp-1 group-hover:text-emerald-600 transition-colors">{label}</p>
          <div className="p-2 bg-emerald-50 rounded-xl shrink-0 border border-emerald-100/50 group-hover:bg-emerald-100 transition-colors">
            <Icon className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            {prefix}{formattedValue}
          </h3>
          
          {delta && (
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex items-center w-fit text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm",
                deltaDirection === "up" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                deltaDirection === "down" ? "bg-red-50 text-red-600 border-red-100" :
                "bg-gray-50 text-gray-500 border-gray-100"
              )}>
                {deltaDirection === "up" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                {deltaDirection === "down" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                {deltaDirection === "neutral" && <Minus className="h-3 w-3 mr-1" />}
                {delta}
              </span>
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">vs last period</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
