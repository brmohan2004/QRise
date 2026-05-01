"use client";

import { BarChart3, Zap, QrCode, HardDrive, ArrowUpRight, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export function UsageCards() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["usage-stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/usage");
      const json = await res.json();
      return json.data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "API Calls",
      value: usage?.api_calls?.current || 0,
      limit: usage?.api_calls?.limit || 10000,
      icon: BarChart3,
      color: "text-primary",
      bg: "bg-primary/5",
      accent: "bg-primary"
    },
    {
      label: "Custom Types",
      value: usage?.custom_types?.current || 0,
      limit: usage?.custom_types?.limit || 5,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
      accent: "bg-amber-500"
    },
    {
      label: "Dynamic QR Codes",
      value: usage?.dynamic_qrs?.current || 0,
      limit: usage?.dynamic_qrs?.limit || 50,
      icon: QrCode,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      accent: "bg-emerald-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => {
        const percent = Math.min((item.value / item.limit) * 100, 100);
        const isCritical = percent > 90;

        return (
          <Card key={item.label} className="p-6 rounded-2xl border-gray-100 shadow-sm bg-white hover:shadow-md transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-xl", item.bg)}>
                  <item.icon className={cn("h-5 w-5", item.color)} />
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                  isCritical ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-500"
                )}>
                  {isCritical ? "Critical" : "On Track"}
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">{item.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-2xl font-black text-gray-900">{item.value.toLocaleString()}</h3>
                  <span className="text-[10px] font-bold text-gray-400">/ {item.limit.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Progress value={percent} className={cn("h-1.5 bg-gray-50", isCritical ? "bg-red-50" : "")} />
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-400">
                  <span>{Math.round(percent)}% Used</span>
                  <span>{item.limit - item.value} Left</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
