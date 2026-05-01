"use client";

import { CreditCard, Zap, CheckCircle2, Package, ArrowUpRight, History, Loader2, Calendar, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PlanSelector } from "@/components/app/usage/plan-selector";


export function SubscriptionOverview() {
  const { data: billingData, isLoading } = useQuery({
    queryKey: ["user-billing-unified"],
    queryFn: async () => {
      const res = await fetch("/api/user/billing");
      const json = await res.json();
      return json.data;
    }
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-emerald-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse text-sm uppercase tracking-widest">Loading subscription details...</p>
      </div>
    );
  }

  const planName = billingData?.plan?.name || "Free";
  const renewalDate = billingData?.plan?.expiresAt ? format(new Date(billingData.plan.expiresAt), 'MMMM d, yyyy') : "N/A";

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Card */}
        <div className="lg:col-span-2 p-8 md:p-10 bg-white border border-slate-200/60 rounded-3xl flex flex-col justify-between relative overflow-hidden group shadow-sm min-h-[350px]">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/[0.03] blur-[80px] rounded-full group-hover:bg-emerald-500/[0.05] transition-all duration-1000" />
          
          <div className="relative z-10 space-y-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/80">Membership Status</span>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 capitalize">{planName}</h3>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                    Active
                  </span>
                </div>
              </div>
              
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Renewal Period</span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-emerald-500" />
                  {renewalDate}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {billingData?.plan?.features?.length > 0 ? (
                billingData.plan.features.map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 text-[13px] font-medium text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {feature}
                  </div>
                ))
              ) : (
                <div className="col-span-full p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-[13px] font-medium text-slate-500">
                    Plan features are being synchronized. Please wait a moment.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 pt-10 flex flex-wrap gap-3">
            <Button className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-emerald-200 text-[10px] uppercase tracking-widest transition-all">
              Change Plan
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 font-bold h-12 px-8 rounded-xl text-[10px] uppercase tracking-widest transition-all">
              Manage Billing
            </Button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-8 bg-white border border-slate-200/60 rounded-3xl flex flex-col justify-between shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Default Method</h4>
              <CreditCard className="h-4 w-4 text-slate-300" />
            </div>
            
            <div className="space-y-4">
              {billingData?.paymentMethod ? (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-7 bg-slate-900 rounded flex items-center justify-center text-[8px] font-black text-white italic">
                    {billingData.paymentMethod.brand.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 tracking-tight">•••• {billingData.paymentMethod.last4}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      Expires {billingData.paymentMethod.expMonth.toString().padStart(2, '0')}/{billingData.paymentMethod.expYear.toString().slice(-2)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-400 font-medium italic">No payment method</p>
                </div>
              )}
            </div>
          </div>
          
          <Button variant="ghost" className="w-full text-emerald-600 font-bold justify-between hover:bg-emerald-50 rounded-xl h-12 px-6 text-[10px] uppercase tracking-widest border border-transparent hover:border-emerald-100/50">
            Payment Settings
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Plans Section */}
      <section className="space-y-8 pt-16 border-t border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-slate-200 rounded-full" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Available Plans</h2>
        </div>
        <PlanSelector />
      </section>

      {/* History Section */}
      <section className="space-y-10 pt-16 border-t border-slate-200/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-6 bg-slate-200 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Billing History</h2>
          </div>
          <Button variant="outline" className="gap-2 text-slate-500 font-bold rounded-2xl border border-slate-200 uppercase text-[10px] tracking-[0.2em] h-12 px-6 hover:bg-slate-50 shadow-sm">
            <History className="h-4 w-4" />
            Export Receipts
          </Button>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b">
              <tr>
                <th className="px-10 py-5 text-left">Document</th>
                <th className="px-10 py-5 text-left">Settlement Date</th>
                <th className="px-10 py-5 text-left">Amount</th>
                <th className="px-10 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billingData?.invoices?.map((invoice: any) => (
                <tr key={invoice.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <Package className="h-5 w-5" />
                      </div>
                      <span className="font-black text-slate-900 italic">{invoice.description}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-slate-500 font-bold tracking-tight">
                    {format(new Date(invoice.date), 'MMMM d, yyyy')}
                  </td>
                  <td className="px-10 py-6 font-black text-slate-900">${invoice.amount}</td>
                  <td className="px-10 py-6 text-right">
                    <span className={cn(
                      "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      invoice.status === 'settled' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-100"
                    )}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!billingData?.invoices?.length && (
                <tr>
                  <td colSpan={4} className="px-10 py-12 text-center text-slate-400 font-medium italic">No invoices found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
