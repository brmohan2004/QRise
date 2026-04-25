"use client";

import { Zap, Activity, BarChart3, X, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UsageDialog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const isOpen = searchParams.get("usage") === "true";

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("usage");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-4xl md:w-[90vw] md:h-[80vh] h-screen w-screen p-0 overflow-hidden rounded-none md:rounded-[40px] border-none shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 italic">SYSTEM USAGE</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time Resource Monitoring</p>
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
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50 space-y-10 custom-scrollbar">
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
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Scans</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-4xl font-black text-slate-900">8,432</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12.5%</span>
                  <span className="text-[11px] font-bold text-slate-400 italic">vs last month</span>
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
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Dynamic QRs</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-4xl font-black text-slate-900">850<span className="text-xl text-slate-300 ml-1">/ 1,000</span></p>
                <div className="h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-[0_0_12px_rgba(217,119,6,0.3)]" 
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
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">API Requests</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-4xl font-black text-slate-900">2,105<span className="text-xl text-slate-300 ml-1">/ 5,000</span></p>
                <div className="h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "42.1%" }}
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.3)]" 
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
                  <h3 className="text-xl font-black text-slate-900 italic uppercase italic tracking-tight">Resource Allocation</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Detailed breakdown of your current plan limits</p>
                </div>
                <Button variant="outline" className="rounded-2xl font-black text-[11px] uppercase tracking-widest h-11 px-6 border-2 hover:bg-slate-50 transition-all gap-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Analytics Hub
                </Button>
             </div>
             <div className="p-10 space-y-8">
                {[
                  { label: "Form Submissions", used: 420, total: 500, color: "bg-emerald-500", icon: CheckCircle2 },
                  { label: "Active Forms", used: 12, total: 20, color: "bg-blue-500", icon: CheckCircle2 },
                  { label: "Team Members", used: 3, total: 5, color: "bg-purple-500", icon: CheckCircle2 },
                  { label: "Custom Domains", used: 1, total: 2, color: "bg-slate-900", icon: CheckCircle2 },
                ].map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", item.color)} />
                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{item.label}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900">{item.used}</span>
                        <span className="text-[11px] font-bold text-slate-300">/ {item.total}</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.used / item.total) * 100}%` }}
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
            className="bg-indigo-600 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-xl shadow-indigo-200"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Zap className="w-64 h-64" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-4 text-center md:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Active Plan: Pro</span>
                </div>
                <h3 className="text-3xl font-black tracking-tight italic">READY TO SCALE?</h3>
                <p className="text-indigo-100 font-bold text-sm leading-relaxed">
                  You're currently using 85% of your Dynamic QR limits. Upgrade to Enterprise for unlimited capacity, dedicated support, and advanced security features.
                </p>
              </div>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 font-black rounded-[20px] px-10 h-16 shadow-lg shadow-black/10 transition-all hover:-translate-y-1 active:translate-y-0 text-sm tracking-widest gap-2">
                UPGRADE TO ENTERPRISE
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
