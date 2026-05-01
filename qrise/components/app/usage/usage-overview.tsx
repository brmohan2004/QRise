"use client";

import { Activity, Zap, BarChart3, CheckCircle2, AlertCircle } from "lucide-react";
import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { UsageMetricCard } from "./usage-metric-card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function UsageOverview() {
  const { data, isLoading, error, refetch } = useUsageStats();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse text-sm uppercase tracking-widest">Gathering resource data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Oops! Something went wrong</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">Failed to load your usage statistics.</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <UsageMetricCard 
          label="Scans"
          current={data.metrics.scans.current}
          limit={data.metrics.scans.limit}
          pct={data.metrics.scans.pct}
          icon={Activity}
          color="emerald"
          delay={0.1}
        />
        <UsageMetricCard 
          label="QRs"
          current={data.metrics.dynamicQrs.current}
          limit={data.metrics.dynamicQrs.limit}
          pct={data.metrics.dynamicQrs.pct}
          icon={Zap}
          color="amber"
          delay={0.2}
        />
        <div className="col-span-2 md:col-span-1">
          <UsageMetricCard 
            label="API Requests"
            current={data.metrics.apiCalls.current}
            limit={data.metrics.apiCalls.limit}
            pct={data.metrics.apiCalls.pct}
            icon={BarChart3}
            color="blue"
            delay={0.3}
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-[40px] border shadow-sm overflow-hidden"
      >
        <div className="px-10 py-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Resource Allocation</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Detailed breakdown of plan limits</p>
          </div>
          
          {Object.values(data.metrics).some(m => m.limit !== -1 && m.current >= m.limit) && (
            <div className="flex items-center gap-3 px-6 py-3 bg-rose-50 border border-rose-100 rounded-2xl animate-pulse">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none">Quota Reached</span>
                <span className="text-xs font-bold text-rose-500 mt-1">Upgrade now to restore service.</span>
              </div>
              <Button size="sm" variant="ghost" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-100 ml-2 border border-rose-200" onClick={() => window.location.search = '?billing=true'}>
                Upgrade
              </Button>
            </div>
          )}
        </div>
        <div className="p-10 space-y-8">
          {[
            { label: "Form Submissions", metric: data.metrics.submissions, color: "bg-emerald-500" },
            { label: "Active Forms", metric: data.metrics.forms, color: "bg-blue-500" },
            { label: "Custom Types", metric: data.metrics.customTypes, color: "bg-indigo-500" },
            { label: "Webhooks", metric: data.metrics.webhooks, color: "bg-rose-500" },
          ].map((item, idx) => (
            <div key={idx} className="group">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.1em]">{item.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-900">{item.metric.current.toLocaleString()}</span>
                  {item.metric.limit !== -1 && (
                    <span className="text-[11px] font-semibold text-slate-300">/ {item.metric.limit.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.metric.pct}%` }}
                  className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
