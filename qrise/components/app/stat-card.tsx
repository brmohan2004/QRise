"use client";

import { useEffect, useState } from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
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
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-muted/60">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        
        <div>
          <h3 className="text-3xl font-bold tracking-tight">
            {prefix}{displayValue.toLocaleString()}
          </h3>
          
          {delta && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full",
                deltaDirection === "up" ? "bg-emerald-500/10 text-emerald-600" :
                deltaDirection === "down" ? "bg-red-500/10 text-red-600" :
                "bg-gray-500/10 text-gray-600"
              )}>
                {deltaDirection === "up" && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
                {deltaDirection === "down" && <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {deltaDirection === "neutral" && <Minus className="h-3 w-3 mr-0.5" />}
                {delta}
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
