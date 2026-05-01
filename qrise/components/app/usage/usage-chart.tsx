"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function UsageChart() {
  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm p-6 bg-white overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-gray-900 tracking-tight">Daily API Activity</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last 30 Days</p>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-gray-400">Success</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-gray-400">Failed</span>
          </div>
        </div>
      </div>
      
      <div className="h-[200px] w-full flex items-end justify-between gap-1">
        {Array.from({ length: 30 }).map((_, i) => {
          const h1 = Math.floor(Math.random() * 80) + 10;
          const h2 = Math.floor(Math.random() * 5);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="w-full flex flex-col justify-end gap-0.5 rounded-t-sm overflow-hidden">
                <div className="bg-primary/10 group-hover:bg-primary/30 transition-colors w-full" style={{ height: `${h1}%` }} />
                <div className="bg-red-400/20 w-full" style={{ height: `${h2}%` }} />
              </div>
              {i % 7 === 0 && <span className="text-[7px] font-black text-gray-300 mt-2">{i+1} Apr</span>}
              
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap border border-gray-800 shadow-2xl">
                <p className="text-[7px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">April {i+1}</p>
                <p className="text-[11px] font-bold">{h1 * 125} Calls</p>
                <p className="text-[8px] text-gray-400 font-medium">{h2 * 12} Failed</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
