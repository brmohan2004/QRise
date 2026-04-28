"use client";

import { useState } from "react";
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
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link 
          href="/qr-codes" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
        </Link>
        
        <div className="flex items-center justify-center min-h-[60vh] bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="max-w-md w-full mx-auto px-4 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 mb-8">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Analytics Disabled
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              This Analytics feature has been disabled by the administrator. 
              Please contact support if you believe this is an error.
            </p>
            
            <div className="p-6 bg-white rounded-2xl border border-gray-100 mb-8 text-left shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Admin Restriction</p>
                  <p className="text-sm text-gray-500">Access to scan data has been suspended.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="space-y-6">
        <Link 
          href="/qr-codes" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Library
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center border-2 border-muted-foreground/10 overflow-hidden shadow-inner">
               <BarChart3 className="w-8 h-8 text-primary/40" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  {isQrLoading ? "Loading..." : (qr?.name || "Untitled QR")}
                </h1>
                <span className={cn(
                  "px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-widest border",
                  qr?.isDynamic !== false 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : "bg-orange-50 text-orange-600 border-orange-200"
                )}>
                  {qr?.isDynamic !== false ? "Dynamic" : "Static"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <ExternalLink className="w-3.5 h-3.5" />
                {typeof window !== 'undefined' && qr ? `${window.location.host}/s/${qr.shortCode || qr.id}` : "loading..."}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
                {(["7d", "30d", "90d"] as const).map((r) => (
                   <Button
                     key={r}
                     variant={range === r ? "secondary" : "ghost"}
                     size="sm"
                     onClick={() => setRange(r)}
                     className={`h-8 px-3 text-xs font-bold transition-all ${
                       range === r ? "bg-background shadow-sm" : "text-muted-foreground"
                     }`}
                   >
                     {r.toUpperCase()}
                   </Button>
                ))}
              </div>
              
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <div className="flex items-center">
                       <Button 
                         size="sm" 
                         variant="outline" 
                         className="font-bold gap-2"
                         onClick={handleExport}
                         disabled={isExporting || !exportEnabled}
                       >
                         {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                         Export
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

              <Button size="sm" variant="outline" className="font-bold gap-2" asChild>
                <Link href={`/create/design?id=${id}`}>
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard label="Total Scans" value={totalScans} delta="+12%" deltaDirection="up" icon={BarChart3} isLoading={isOverviewLoading} />
        <StatCard label="Unique Scans" value={totalUnique} delta="+8%" deltaDirection="up" icon={BarChart3} isLoading={isOverviewLoading} />
        <StatCard label="Avg. Daily" value={Math.round(totalScans / (range === '7d' ? 7 : range === '30d' ? 30 : 90))} icon={Calendar} isLoading={isOverviewLoading} />
        <StatCard label="Conversion" value={Math.round((totalUnique / (totalScans || 1)) * 100)} prefix="" icon={BarChart3} isLoading={isOverviewLoading} />
      </div>

      {/* Tabs / Detailed View */}
      <Card className="rounded-2xl shadow-sm border-muted/60 overflow-hidden">
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b bg-muted/20 px-6 pt-2">
            <TabsList className="bg-transparent h-auto p-0 flex space-x-8">
              {["Overview", "Location", "Devices", "Time", "Raw Events"].map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab.toLowerCase().replace(" ", "-")}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground font-bold text-xs uppercase tracking-widest pb-4 transition-all data-[state=active]:shadow-none px-0"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <div className="p-6 sm:p-8 min-h-[500px]">
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
