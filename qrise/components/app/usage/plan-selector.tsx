"use client";

import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "For personal projects",
    features: ["1k API Calls/mo", "No Custom Types", "Basic Analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    description: "For growing developers",
    features: ["50k API Calls/mo", "25 Custom Types", "Webhooks", "Priority Support"],
  },
  {
    id: "business",
    name: "Business",
    price: "$99",
    description: "For scaling enterprises",
    features: ["Unlimited API Calls", "Unlimited Custom Types", "Custom Domains", "SLA Guarantee"],
  }
];

export function PlanSelector() {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      return (await res.json()).data;
    }
  });

  const currentPlan = user?.plan?.name?.toLowerCase() || "free";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLANS.map((plan) => {
        const isCurrent = plan.id === currentPlan;
        
        return (
          <Card key={plan.name} className={cn(
            "p-8 rounded-[2.5rem] border transition-all",
            isCurrent ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-gray-100 bg-white"
          )}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{plan.description}</p>
                </div>
                {isCurrent && (
                  <span className="px-3 py-1 bg-primary text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                    Current Plan
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                <span className="text-xs font-bold text-gray-400">/mo</span>
              </div>

              <div className="space-y-3">
                {plan.features.map((f) => (
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
                  isCurrent ? "border-primary text-primary hover:bg-primary/5" : ""
                )}
                disabled={isCurrent}
              >
                {isCurrent ? "Manage Subscription" : "Upgrade Now"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
