"use client";

import { useState } from "react";
import { EmbedPreview } from "@/components/qr/embed-preview";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Loader2, Edit3, ExternalLink, Calendar, BarChart3, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScanTimeline } from "@/components/analytics/scan-timeline";
import { LocationMap } from "@/components/analytics/location-map";
import { DeviceChart } from "@/components/analytics/device-chart";
import { TimeHeatmap } from "@/components/analytics/time-heatmap";
import { RawEventsTable } from "@/components/analytics/raw-events-table";
import { StatCard } from "@/components/app/stat-card";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, ShieldAlert } from "lucide-react";

interface AnalyticsClientProps {
  id: string;
  exportEnabled: boolean;
}

export function AnalyticsClient({ id, exportEnabled }: AnalyticsClientProps) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch QR details
  const { data: qr, isLoading: isQrLoading } = useQuery({
    queryKey: ['qr', id],
    queryFn: async () => {
      const res = await fetch(`/api/qr/${id}`);
      if (!res.ok) throw new Error("Failed to fetch QR details");
      const json = await res.json();
      return json.data;
    },
    enabled: !!id && id !== 'undefined'
  });

  // Use a master query to fetch overview stats
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['analytics', id, 'overview', range],
    queryFn: async () => {
      const res = await fetch(`/api/qr/${id}/analytics?range=${range}&type=overview`);
      if (!res.ok) throw new Error("Failed to fetch overview");
      return res.json();
    },
    enabled: !!id && id !== 'undefined' && qr?.isDynamic !== false
  });

  // Individual queries for tabs
  const fetchTab = async (type: string) => {
    const res = await fetch(`/api/qr/${id}/analytics?range=${range}&type=${type}`);
    if (!res.ok) throw new Error(`Failed to fetch ${type}`);
    return res.json();
  };

  const locationQuery = useQuery({ 
    queryKey: ['analytics', id, 'location', range], 
    queryFn: () => fetchTab('location'),
    enabled: !!id && id !== 'undefined' && qr?.isDynamic !== false
  });
  const deviceQuery = useQuery({ 
    queryKey: ['analytics', id, 'device', range], 
    queryFn: () => fetchTab('device'),
    enabled: !!id && id !== 'undefined' && qr?.isDynamic !== false
  });
  const timeQuery = useQuery({ 
    queryKey: ['analytics', id, 'time', range], 
    queryFn: () => fetchTab('time'),
    enabled: !!id && id !== 'undefined' && qr?.isDynamic !== false
  });
  const rawQuery = useQuery({ 
    queryKey: ['analytics', id, 'raw', range], 
    queryFn: () => fetchTab('raw'),
    enabled: !!id && id !== 'undefined' && qr?.isDynamic !== false
  });

  const totalScans = overview?.trend?.reduce((acc: number, curr: any) => acc + curr.scans, 0) || 0;
  const totalUnique = overview?.trend?.reduce((acc: number, curr: any) => acc + curr.unique, 0) || 0;

  const handleExport = async () => {
    if (!exportEnabled) {
      toast.error("Export feature is currently disabled.");
      return;
    }
    setIsExporting(true);
    try {
      const res = await fetch(`/api/qr/${id}/analytics/export`);
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-analytics-${id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Analytics exported successfully");
    } catch (error) {
      toast.error("Failed to export analytics");
    } finally {
      setIsExporting(false);
    }
  };

  if (!exportEnabled) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/qr-codes" 
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Restricted Access</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">Analytics Disabled</h1>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[50vh] bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="max-w-md w-full mx-auto px-6 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 mb-8 border border-red-100 shadow-sm">
              <ShieldAlert className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Access Suspended</h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              This Analytics feature has been disabled by the administrator. 
              Please contact support if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 sm:px-6">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/qr-codes" 
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm"
            title="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Analytics Dashboard</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">
              {isQrLoading ? "Loading..." : (qr?.name || "Untitled QR")}
            </h1>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner shrink-0">
               <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600/40" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={cn(
                  "px-2 py-0.5 text-[9px] font-black uppercase rounded-full tracking-widest border shadow-sm",
                  qr?.isDynamic !== false 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                    : "bg-gray-50 text-gray-500 border-gray-100"
                )}>
                  {qr?.isDynamic !== false ? "Dynamic" : "Static"}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                  {qr?.type || 'URL'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium truncate">
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600/50" />
                <span className="truncate opacity-70">
                  {typeof window !== 'undefined' && qr ? `${window.location.host}/s/${qr.shortCode || qr.id}` : "loading..."}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 md:pt-0 border-t md:border-0 border-gray-50">
             <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-sm">
                {(["7d", "30d", "90d"] as const).map((r) => (
                   <Button
                     key={r}
                     variant={range === r ? "secondary" : "ghost"}
                     size="sm"
                     onClick={() => setRange(r)}
                     className={cn(
                       "h-8 px-3 text-[10px] font-black uppercase tracking-widest transition-all",
                       range === r ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                     )}
                   >
                     {r}
                   </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 px-4 font-black text-[10px] uppercase tracking-widest gap-2 rounded-xl border-gray-100 bg-white hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"
                        onClick={handleExport}
                        disabled={isExporting || !exportEnabled}
                      >
                        {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Export
                      </Button>
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

                <Button size="sm" variant="outline" className="h-9 px-4 font-black text-[10px] uppercase tracking-widest gap-2 rounded-xl border-gray-100 bg-white hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm" asChild>
                  <Link href={`/create/${qr?.type}?edit=${id}`}>
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard label="Total Scans" value={totalScans} delta="+12%" deltaDirection="up" icon={BarChart3} isLoading={isOverviewLoading} />
        <StatCard label="Unique Scans" value={totalUnique} delta="+8%" deltaDirection="up" icon={BarChart3} isLoading={isOverviewLoading} />
        <StatCard label="Avg. Daily" value={Math.round(totalScans / (range === '7d' ? 7 : range === '30d' ? 30 : 90))} icon={Calendar} isLoading={isOverviewLoading} />
        <StatCard label="Conversion" value={Math.round((totalUnique / (totalScans || 1)) * 100)} prefix="" icon={BarChart3} isLoading={isOverviewLoading} />
      </div>

      {/* Tabs / Detailed View */}
      <Card className="rounded-3xl shadow-sm border border-gray-100 overflow-hidden bg-white">
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b bg-gray-50/50 px-4 sm:px-8 pt-2 overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent h-auto p-0 flex space-x-6 sm:space-x-8 min-w-max">
              {["Overview", "Location", "Devices", "Time", "Raw Events", "Embed & Export"].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab.toLowerCase().replace(" ", "-").replace("&", "and")}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] pb-4 transition-all data-[state=active]:shadow-none px-0"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <div className="p-4 sm:p-8 min-h-[400px]">
             <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
               <ScanTimeline data={overview?.trend || []} isLoading={isOverviewLoading} exportEnabled={exportEnabled} />
             </TabsContent>
             
             <TabsContent value="location" className="mt-0 focus-visible:outline-none">
                <LocationMap data={locationQuery.data || []} isLoading={locationQuery.isLoading} />
             </TabsContent>
             
             <TabsContent value="devices" className="mt-0 focus-visible:outline-none">
                <DeviceChart data={deviceQuery.data || { deviceType: [], os: [] }} />
             </TabsContent>
             
             <TabsContent value="time" className="mt-0 focus-visible:outline-none">
                <TimeHeatmap data={timeQuery.data || []} />
             </TabsContent>
             
             <TabsContent value="raw-events" className="mt-0 focus-visible:outline-none">
                <RawEventsTable events={rawQuery.data || []} isLoading={rawQuery.isLoading} />
             </TabsContent>

             <TabsContent value="embed-and-export" className="mt-0 focus-visible:outline-none">
                <EmbedPreview id={id} name={qr?.name || "Untitled QR"} />
             </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-card text-card-foreground", className)}>
      {children}
    </div>
  );
}
