"use client";

import { Zap, Activity, BarChart3, X, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface UsageData {
  usage: {
    monthlyScans: number;
    dynamicQrs: number;
    apiCalls: number;
    formSubmissions: number;
    activeForms: number;
  };
  plan: {
    name: string;
    limits: {
      monthlyScans: number;
      dynamicQrs: number;
      apiCalls: number;
      formSubmissions: number;
      forms: number;
    };
  };
}

export function UsageDialog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const isOpen = searchParams.get("usage") === "true";

  const { data, isLoading: loading, error, refetch: fetchUsage } = useQuery<UsageData>({
    queryKey: ["user-usage"],
    queryFn: async () => {
      const response = await fetch("/api/user/usage");
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to load usage data");
      }
      return result.data;
    },
    enabled: isOpen
  });

  const errorMessage = error instanceof Error ? error.message : (error as string | null);


  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("usage");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // Helper to calculate percentage safely
  const getPercentage = (used: number, total: number) => {
    if (!total || total === -1) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-4xl md:w-[90vw] md:h-[80vh] h-[85vh] w-[95vw] p-0 overflow-hidden rounded-[32px] md:rounded-[48px] border-none shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 leading-none">System Usage</h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 md:mt-1.5">Real-time Resource Monitoring</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900 group"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50 space-y-10 custom-scrollbar relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm z-50">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Gathering resource data...</p>
            </div>
          ) : null}

          {errorMessage && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Oops! Something went wrong</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">{errorMessage}</p>
              </div>
              <Button 
                onClick={() => fetchUsage()}
                variant="outline"
                className="rounded-xl border-slate-200"
              >
                Try Again
              </Button>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-8 rounded-[32px] border shadow-sm space-y-5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity className="w-24 h-24" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Monthly Scans</span>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                      {formatNumber(data.usage.monthlyScans)}
                      {data.plan.limits.monthlyScans !== -1 && (
                        <span className="text-lg md:text-xl text-slate-300 ml-1 font-medium">/ {formatNumber(data.plan.limits.monthlyScans)}</span>
                      )}
                    </p>
                    <div className="h-1.5 md:h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getPercentage(data.usage.monthlyScans, data.plan.limits.monthlyScans)}%` }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.2)]" 
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-8 rounded-[32px] border shadow-sm space-y-5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap className="w-24 h-24" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Dynamic QRs</span>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                      {formatNumber(data.usage.dynamicQrs)}
                      {data.plan.limits.dynamicQrs !== -1 && (
                        <span className="text-lg md:text-xl text-slate-300 ml-1 font-medium">/ {formatNumber(data.plan.limits.dynamicQrs)}</span>
                      )}
                    </p>
                    <div className="h-1.5 md:h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getPercentage(data.usage.dynamicQrs, data.plan.limits.dynamicQrs)}%` }}
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-[0_0_12px_rgba(217,119,6,0.2)]" 
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-8 rounded-[32px] border shadow-sm space-y-5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BarChart3 className="w-24 h-24" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">API Requests</span>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                      {formatNumber(data.usage.apiCalls)}
                      {data.plan.limits.apiCalls !== -1 && (
                        <span className="text-lg md:text-xl text-slate-300 ml-1 font-medium">/ {formatNumber(data.plan.limits.apiCalls)}</span>
                      )}
                    </p>
                    <div className="h-1.5 md:h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getPercentage(data.usage.apiCalls, data.plan.limits.apiCalls)}%` }}
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.2)]" 
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Breakdown Table/List */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-[40px] border shadow-sm overflow-hidden"
              >
                 <div className="px-10 py-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Resource Allocation</h3>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 md:mt-1.5">Detailed breakdown of plan limits</p>
                    </div>
                    <Button variant="outline" className="rounded-xl md:rounded-2xl font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] h-10 md:h-12 px-5 md:px-6 border border-slate-200 hover:bg-slate-50 transition-all gap-2 shadow-sm">
                      <BarChart3 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      Analytics Hub
                    </Button>
                 </div>
                 <div className="p-10 space-y-8">
                    {[
                      { label: "Form Submissions", used: data.usage.formSubmissions, total: data.plan.limits.formSubmissions, color: "bg-emerald-500", icon: CheckCircle2 },
                      { label: "Active Forms", used: data.usage.activeForms, total: data.plan.limits.forms, color: "bg-blue-500", icon: CheckCircle2 },
                    ].map((item, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between items-end mb-3">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={cn("w-2 h-2 md:w-2.5 md:h-2.5 rounded-full", item.color)} />
                            <span className="text-[10px] md:text-[11px] font-bold text-slate-700 uppercase tracking-[0.1em]">{item.label}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg md:text-xl font-bold text-slate-900">{formatNumber(item.used)}</span>
                            {item.total !== -1 && (
                              <span className="text-[10px] md:text-[11px] font-semibold text-slate-300">/ {formatNumber(item.total)}</span>
                            )}
                          </div>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${getPercentage(item.used, item.total)}%` }}
                            className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                          />
                        </div>
                      </div>
                    ))}
                 </div>
              </motion.div>

              {/* Upgrade Banner */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-900 rounded-[32px] md:rounded-[48px] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl shadow-slate-200"
              >
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="w-64 h-64 md:w-80 md:h-80 text-emerald-500/20 blur-3xl" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="space-y-4 text-center md:text-left max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                      <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Plan: {data.plan.name.toUpperCase()}</span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold tracking-tight">
                      {data.plan.name.toLowerCase() === 'business' || data.plan.name.toLowerCase() === 'enterprise'
                        ? "Enterprise Scalability"
                        : getPercentage(data.usage.dynamicQrs, data.plan.limits.dynamicQrs) > 80 
                          ? "Approaching Limits!" 
                          : "Ready to Scale?"}
                    </h3>
                    <p className="text-slate-400 font-medium text-xs md:text-sm leading-relaxed max-w-md">
                      {data.plan.name.toLowerCase() === 'business' || data.plan.name.toLowerCase() === 'enterprise'
                        ? "You are currently on a premium plan. For higher volume requirements or custom integrations, contact our enterprise team."
                        : getPercentage(data.usage.dynamicQrs, data.plan.limits.dynamicQrs) > 80 
                          ? `You've used ${getPercentage(data.usage.dynamicQrs, data.plan.limits.dynamicQrs)}% of your Dynamic QR limits. Upgrade for unlimited capacity.`
                          : "Unlock more features and higher limits by upgrading to a higher plan."}
                    </p>
                  </div>
                  <Button size="lg" className="w-full md:w-auto bg-emerald-500 text-white hover:bg-emerald-400 font-bold rounded-xl md:rounded-2xl px-8 md:px-12 h-14 md:h-16 shadow-2xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-[10px] md:text-[11px] tracking-[0.2em] gap-2 md:gap-3">
                    {data.plan.name.toLowerCase() === 'business' || data.plan.name.toLowerCase() === 'enterprise' ? "CONTACT SALES" : "UPGRADE NOW"}
                    <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
