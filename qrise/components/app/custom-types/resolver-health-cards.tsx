"use client";

import { Card } from "@/components/ui/card";
import { Activity, AlertCircle, Clock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResolverHealthCardsProps {
  summary: {
    total_calls: number;
    error_rate: number;
    avg_latency_ms: number;
    fallback_rate: number;
  };
  isLoading?: boolean;
}

export function ResolverHealthCards({ summary, isLoading }: ResolverHealthCardsProps) {
  const stats = [
    {
      label: "Total Calls",
      value: summary.total_calls.toLocaleString(),
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Error Rate",
      value: `${summary.error_rate.toFixed(1)}%`,
      icon: AlertCircle,
      color: summary.error_rate > 5 ? "text-red-600" : "text-green-600",
      bg: summary.error_rate > 5 ? "bg-red-50" : "bg-green-50",
      status: summary.error_rate < 5 ? "Green" : summary.error_rate < 20 ? "Yellow" : "Red"
    },
    {
      label: "Avg Latency",
      value: `${summary.avg_latency_ms}ms`,
      icon: Clock,
      color: summary.avg_latency_ms > 2000 ? "text-amber-600" : "text-blue-600",
      bg: summary.avg_latency_ms > 2000 ? "bg-amber-50" : "bg-blue-50"
    },
    {
      label: "Fallback Rate",
      value: `${summary.fallback_rate.toFixed(1)}%`,
      icon: RotateCcw,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", stat.bg)}>
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{isLoading ? "..." : stat.value}</h3>
              {stat.status && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={cn("h-1.5 w-1.5 rounded-full", 
                    stat.status === "Green" ? "bg-green-500" : 
                    stat.status === "Yellow" ? "bg-amber-500" : "bg-red-500"
                  )} />
                  <span className="text-[9px] font-black uppercase tracking-tight text-gray-500">{stat.status} Health</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
