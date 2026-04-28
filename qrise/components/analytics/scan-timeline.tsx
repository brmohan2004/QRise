"use client";

import { useState, useEffect } from "react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScanTimelineProps {
  data: { date: string, scans: number, unique: number }[];
  isLoading?: boolean;
  exportEnabled?: boolean;
}

export function ScanTimeline({ data, isLoading, exportEnabled = true }: ScanTimelineProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleExport = () => {
    const headers = "Date,Total Scans,Unique Scans\n";
    const rows = data.map(d => `${d.date},${d.scans},${d.unique}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Card className="shadow-none border-none bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between px-0 pt-0 pb-6">
        <div className="flex flex-col">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Scan Activity</CardTitle>
          <p className="text-xs text-gray-400 mt-1">Daily performance overview</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm px-4" 
                  onClick={handleExport}
                  disabled={!exportEnabled}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </div>
            </TooltipTrigger>
            {!exportEnabled && (
              <TooltipContent className="bg-gray-900 text-white border-none rounded-xl text-[10px] font-bold uppercase tracking-widest">
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-red-400" />
                  Export Disabled
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[250px] sm:h-[350px] w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.05} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.95)", 
                    borderRadius: "16px", 
                    border: "1px solid #f1f5f9",
                    fontSize: "11px",
                    fontWeight: "700",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    backdropFilter: "blur(4px)"
                  }}
                  itemStyle={{ padding: "2px 0" }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  height={40} 
                  iconType="circle" 
                  wrapperStyle={{ 
                    fontSize: '9px', 
                    fontWeight: '900', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em',
                    color: '#94a3b8'
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Scans"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="unique"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorUnique)"
                  name="Unique Scans"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-gray-50/50 animate-pulse rounded-2xl border border-gray-100" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
