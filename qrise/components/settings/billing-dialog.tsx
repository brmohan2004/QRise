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
      <DialogContent showCloseButton={false} className="sm:max-w-5xl md:w-[95vw] md:h-[85vh] h-screen w-screen p-0 overflow-hidden rounded-none md:rounded-[40px] border-none shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 italic uppercase">Subscription</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage your plan and invoices</p>
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
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Plan & Billing</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Plan Card */}
                <div className="lg:col-span-2 p-12 bg-indigo-600 rounded-[48px] text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between relative overflow-hidden group">
                  <Zap className="absolute -right-12 -top-12 w-80 h-80 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                  
                  <div className="relative z-10 space-y-10">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">Current active tier</span>
                        <h3 className="text-5xl font-black capitalize tracking-tight italic">{planName}</h3>
                      </div>
                      <div className="px-6 py-3 bg-white/10 rounded-full border border-white/20 text-[11px] font-black uppercase tracking-widest backdrop-blur-md">
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

                  <div className="relative z-10 pt-16 flex flex-wrap gap-4">
                    <Button className="bg-white text-indigo-600 hover:bg-slate-50 font-black h-14 px-10 rounded-2xl shadow-xl shadow-indigo-900/20 text-xs uppercase tracking-widest">
                      Manage Subscription
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-black h-14 px-10 rounded-2xl backdrop-blur-sm text-xs uppercase tracking-widest">
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
                  
                  <Button variant="ghost" className="w-full text-indigo-600 font-black justify-between hover:bg-indigo-50 rounded-2xl h-14 px-6 text-xs uppercase tracking-widest">
                    Update Methods
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* History Section */}
              <section className="space-y-10 pt-16 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-slate-200 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase tracking-tight">Financial ledger</h2>
                  </div>
                  <Button variant="outline" className="gap-2 text-slate-500 font-black rounded-xl border-2 uppercase text-[10px] tracking-widest h-10 px-5 hover:bg-slate-50">
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
