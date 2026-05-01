"use client";

import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export function PlanSelector() {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      return (await res.json()).data;
    }
  });

  const { data: plansList, isLoading } = useQuery({
    queryKey: ["available-plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans");
      return (await res.json()).data;
    }
  });

  const currentPlan = user?.plan?.name?.toLowerCase() || "free";

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plansList?.map((plan: any) => {
        const isCurrent = plan.name.toLowerCase() === currentPlan;
        const features = [
          plan.hasAnalytics && "Advanced Analytics",
          plan.hasApiAccess && "API Access",
          plan.hasBulkGenerator && "Bulk Generator",
          plan.hasSmartRouting && "Smart Routing",
          plan.monthlyScanLimit !== -1 ? `${plan.monthlyScanLimit.toLocaleString()} Scans` : "Unlimited Scans",
          plan.dynamicQrLimit !== -1 ? `${plan.dynamicQrLimit.toLocaleString()} Dynamic QRs` : "Unlimited Dynamic QRs",
        ].filter(Boolean);
        
        return (
          <Card key={plan.id} className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isCurrent ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-gray-100 bg-white"
          )}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-1">{plan.description}</p>
                </div>
                {isCurrent && (
                  <span className="px-3 py-1 bg-primary text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                    Current
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">${plan.priceMonthly}</span>
                <span className="text-xs font-bold text-gray-400">/mo</span>
              </div>

              <div className="space-y-3">
                {features.map((f: string) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={isCurrent ? "outline" : "default"}
                className={cn(
                  "w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest",
                  isCurrent ? "border-primary text-primary hover:bg-primary/5" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200"
                )}
                disabled={isCurrent}
              >
                {isCurrent ? "Active Plan" : "Upgrade Now"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
