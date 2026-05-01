"use client";

import { Zap, CreditCard, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
} from "@/components/ui/sheet";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { UsageOverview } from "@/components/app/usage/usage-overview";
import { SubscriptionOverview } from "@/components/app/billing/subscription-overview";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ManagementDialog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const isUsageOpen = searchParams.get("usage") === "true";
  const isBillingOpen = searchParams.get("billing") === "true";
  const isOpen = isUsageOpen || isBillingOpen;

  const [activeTab, setActiveTab] = useState<"usage" | "billing">("usage");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isUsageOpen) setActiveTab("usage");
    if (isBillingOpen) setActiveTab("billing");
  }, [isUsageOpen, isBillingOpen]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("usage");
    params.delete("billing");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const FormContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#0F6E56] px-6 sm:px-8 py-5 sm:py-6 text-white relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all bg-white/10 backdrop-blur-md border border-white/10",
                activeTab === "usage" ? "text-emerald-300" : "text-emerald-100/50"
              )}>
                {activeTab === "usage" ? <Zap className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight leading-none">
                  {activeTab === "usage" ? "System Usage" : "Subscription"}
                </h2>
                <p className="text-[9px] sm:text-[10px] font-bold text-emerald-100/60 uppercase tracking-[0.2em] mt-1 sm:mt-1.5">
                  {activeTab === "usage" ? "Resource Monitoring" : "Billing Management"}
                </p>
              </div>
            </div>

            <div className="flex items-center p-1 bg-black/10 rounded-xl border border-white/5 w-fit">
              <button
                onClick={() => setActiveTab("usage")}
                className={cn(
                  "px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  activeTab === "usage" ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-100/50 hover:text-white"
                )}
              >
                Usage
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={cn(
                  "px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  activeTab === "billing" ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-100/50 hover:text-white"
                )}
              >
                Plan
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/50 hover:text-white group sm:flex hidden"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-50 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {activeTab === "usage" ? <UsageOverview /> : <SubscriptionOverview />}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <SheetContent side="bottom" className="p-0 h-[92vh] rounded-t-3xl overflow-hidden border-none outline-none">
            <FormContent />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent showCloseButton={false} className="sm:max-w-4xl md:h-[80vh] h-[90vh] w-[95vw] p-0 overflow-hidden rounded-3xl border-none shadow-2xl flex flex-col">
            <FormContent />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
