"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DashboardStats } from "@/components/app/dashboard-stats";
import { ScanTrendChart } from "@/components/app/scan-trend-chart";
import { WorldScanMap } from "@/components/app/world-scan-map";
import { ActivityFeed } from "@/components/app/activity-feed";
import { TopQRList } from "@/components/app/top-qr-list";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success } = useToast();
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");

  // Check if user has any QRs for onboarding redirect
  const { data: qrData } = useQuery({
    queryKey: ["qr-count"],
    queryFn: async () => {
      const res = await fetch("/api/qr?limit=1");
      if (!res.ok) return { total: 0 };
      const data = await res.json();
      return { total: data.total || 0 };
    },
  });

  // Redirect to onboarding if user has no QRs and hasn't skipped
  useEffect(() => {
    if (qrData && qrData.total === 0) {
      const skipped = localStorage.getItem("skipped_onboarding");
      if (!skipped) {
        router.push("/onboarding");
      }
    }
  }, [qrData, router]);

  const { 
    data: analyticsData, 
    isLoading: isAnalyticsLoading, 
    isFetching: isAnalyticsFetching,
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ["analytics", range],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?range=${range}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const { 
    data: statsData, 
    isLoading: isStatsLoading, 
    isFetching: isStatsFetching,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const isRefreshing = isAnalyticsFetching || isStatsFetching;

  const handleRefresh = async () => {
    // Force a refetch of all dashboard-related data
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["analytics"] }),
        queryClient.invalidateQueries({ queryKey: ["stats"] }),
        // Add a tiny artificial delay for better UX if the network is too fast
        new Promise(resolve => setTimeout(resolve, 500))
      ]);
      success("Dashboard data updated");
    } catch (error) {
      console.error("Refresh error:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground text-sm font-medium">
            Real-time performance across your QR code ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Live tracking active</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 font-bold bg-background shadow-sm border-muted-foreground/10"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={cn("h-3.5 w-3.5 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ScanTrendChart 
            data={analyticsData?.trend || []} 
            range={range} 
            onRangeChange={setRange}
            isLoading={isAnalyticsLoading}
          />
        </div>
        <div className="lg:col-span-4">
          <WorldScanMap data={analyticsData?.locations || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        <div className="lg:col-span-7">
          <div className="flex flex-col h-full rounded-2xl border border-muted/60 bg-background overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between bg-muted/20">
              <h3 className="font-bold text-base">Recent Scans</h3>
              <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded-md border">Latest 5</span>
            </div>
            <div className="p-4 sm:p-6">
              <ActivityFeed 
                events={statsData?.recentActivity || []} 
                isLoading={isStatsLoading} 
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
           <TopQRList 
             data={statsData?.topQRs || []} 
             isLoading={isStatsLoading}
           />
        </div>
      </div>
    </div>
  );
}
