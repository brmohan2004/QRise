"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@/components/app/dashboard-stats";
import { ScanTrendChart } from "@/components/app/scan-trend-chart";
import { WorldScanMap } from "@/components/app/world-scan-map";
import { ActivityFeed } from "@/components/app/activity-feed";
import { TopQRList } from "@/components/app/top-qr-list";

export default function DashboardPage() {
  const router = useRouter();
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
  } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

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
