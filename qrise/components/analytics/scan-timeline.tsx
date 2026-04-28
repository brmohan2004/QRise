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
    // Generate CSV data
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
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Scan Timeline</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs font-bold gap-2" 
                  onClick={handleExport}
                  disabled={!exportEnabled}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
              </div>
            </TooltipTrigger>
            {!exportEnabled && (
              <TooltipContent className="bg-destructive text-destructive-foreground border-none">
                <p className="flex items-center gap-2 text-xs font-bold">
                  <AlertCircle className="h-3 w-3" />
                  This Analytics Export has been disabled by admin
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[350px] w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height={350} minWidth={0} minHeight={350} debounce={100}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderRadius: "12px", 
                    border: "1px solid hsl(var(--border))",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                  }}
                />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Scans"
                />
                <Area
                  type="monotone"
                  dataKey="unique"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorUnique)"
                  name="Unique Scans"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-slate-50/50 animate-pulse rounded-xl" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
