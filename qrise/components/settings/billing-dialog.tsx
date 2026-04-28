"use client";

import { X, CreditCard, Zap, CheckCircle2, Package, ArrowUpRight, History, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PLAN_FEATURES = [
  "Unlimited Dynamic QRs",
  "Advanced Analytics",
  "Custom Link Routing",
  "API Access",
  "Priority Support",
];

export function BillingDialog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const isOpen = searchParams.get("billing") === "true";

  const { data: userData, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      const json = await res.json();
      return json.data;
    },
    enabled: isOpen
  });

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("billing");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const planName = userData?.plan?.name || "Free";
  const renewalDate = userData?.planExpiresAt ? format(new Date(userData.planExpiresAt), 'MMMM d, yyyy') : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-5xl md:w-[95vw] md:h-[85vh] h-[90vh] w-[95vw] p-0 overflow-hidden rounded-[32px] md:rounded-[48px] border-none shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 leading-none">Subscription</h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 md:mt-1.5">Manage your plan and invoices</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900 group"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-50 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" /></div>
          ) : (
            <div className="space-y-16">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-1.5 h-5 md:h-6 bg-emerald-600 rounded-full" />
                <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Plan & Billing</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Plan Card */}
                <div className="lg:col-span-2 p-8 md:p-12 bg-slate-900 rounded-[32px] md:rounded-[56px] text-white shadow-2xl shadow-slate-200 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-1000" />
                  
                  <div className="relative z-10 space-y-8 md:space-y-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 md:space-y-3">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400">Current active tier</span>
                        <h3 className="text-4xl md:text-6xl font-bold tracking-tight">{planName}</h3>
                      </div>
                      <div className="px-4 py-2 md:px-6 md:py-3 bg-white/5 rounded-full border border-white/10 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md shrink-0">
                        {userData?.planExpiresAt ? `Renews on ${renewalDate}` : 'Free Tier Active'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {PLAN_FEATURES.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-indigo-50">
                          <CheckCircle2 className="h-5 w-5 text-indigo-300" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 pt-10 md:pt-16 flex flex-wrap gap-3 md:gap-4">
                    <Button className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-400 text-white font-bold h-14 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl shadow-xl shadow-emerald-900/20 text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02]">
                      Manage Subscription
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none border-white/10 text-white hover:bg-white/5 font-bold h-14 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl backdrop-blur-sm text-[10px] md:text-[11px] uppercase tracking-[0.2em]">
                      View Invoices
                    </Button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-10 bg-white border border-slate-200/60 rounded-[48px] flex flex-col justify-between shadow-sm">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment Method</h4>
                      <CreditCard className="h-5 w-5 text-slate-400" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                        <div className="w-12 h-8 bg-black rounded-lg flex items-center justify-center text-[10px] font-black text-white italic">VISA</div>
                        <div className="flex-1">
                          <p className="text-base font-black text-slate-900 tracking-tight">•••• 4242</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Exp 09 / 27</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" className="w-full text-emerald-600 font-bold justify-between hover:bg-emerald-50 rounded-xl md:rounded-2xl h-14 md:h-16 px-6 text-[9px] md:text-[10px] uppercase tracking-[0.2em]">
                    Update Methods
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* History Section */}
              <section className="space-y-10 pt-16 border-t border-slate-200/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-1.5 h-5 md:h-6 bg-slate-200 rounded-full" />
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Financial ledger</h2>
                  </div>
                  <Button variant="outline" className="gap-2 text-slate-500 font-bold rounded-xl md:rounded-2xl border border-slate-200 uppercase text-[9px] md:text-[10px] tracking-[0.2em] h-10 md:h-12 px-5 md:px-6 hover:bg-slate-50 shadow-sm">
                    <History className="h-4 w-4" />
                    Export Receipts
                  </Button>
                </div>

                <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b">
                      <tr>
                        <th className="px-10 py-5 text-left font-black">Document</th>
                        <th className="px-10 py-5 text-left font-black">Settlement Date</th>
                        <th className="px-10 py-5 text-left font-black">Amount</th>
                        <th className="px-10 py-5 text-right font-black">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[1, 2, 3].map((_, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Package className="h-5 w-5" />
                              </div>
                              <span className="font-black text-slate-900 italic">Monthly Pro — April 2026</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-slate-500 font-bold tracking-tight">April 20, 2026</td>
                          <td className="px-10 py-6 font-black text-slate-900">$29.00</td>
                          <td className="px-10 py-6 text-right">
                            <span className="inline-flex px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Settled</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
