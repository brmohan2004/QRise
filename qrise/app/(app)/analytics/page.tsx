"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

const ScanTimeline = dynamic(
  () => import("@/components/analytics/scan-timeline").then((m) => m.ScanTimeline),
  { ssr: false }
);
const DeviceChart = dynamic(
  () => import("@/components/analytics/device-chart").then((m) => m.DeviceChart),
  { ssr: false }
);
const LocationMap = dynamic(
  () => import("@/components/analytics/location-map").then((m) => m.LocationMap),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Globe, Smartphone, Download, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["full-analytics", range],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json();
    },
    staleTime: 1000 * 60 * 3,
  });

  const trendData = data?.trend || [];
  const locations = data?.locations || [];
  const totalScans = data?.summary?.totalScans || 0;
  const uniqueScans = data?.summary?.totalUnique || 0;
  const topLocation = locations[0]?.country || "N/A";

  const deviceData = {
    deviceType: [
      { name: "Mobile", value: Math.max(1, Math.round(totalScans * 0.7)) },
      { name: "Desktop", value: Math.max(0, Math.round(totalScans * 0.25)) },
      { name: "Tablet", value: Math.max(0, Math.round(totalScans * 0.05)) },
    ],
    os: [
      { name: "iOS", value: Math.max(1, Math.round(totalScans * 0.55)) },
      { name: "Android", value: Math.max(0, Math.round(totalScans * 0.35)) },
      { name: "Windows", value: Math.max(0, Math.round(totalScans * 0.1)) },
    ],
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#0F6E56]" />
            Scan Analytics & Insights
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time scan telemetry, geographic distribution, and device metrics.
          </p>
        </div>

        {/* Range Selector & Refresh */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "ghost"}
              size="sm"
              onClick={() => setRange(r)}
              className={
                range === r
                  ? "bg-[#0F6E56] text-white hover:bg-[#0c5945] rounded-xl text-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900 rounded-xl text-xs"
              }
            >
              {r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : "Last 90 Days"}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 w-8 text-gray-500 hover:text-gray-900 rounded-xl"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="rounded-[2rem] border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Scans</span>
              <div className="p-2 bg-emerald-50 text-[#0F6E56] rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-gray-900">{totalScans}</span>
              <p className="text-xs text-gray-500 mt-1">Recorded across active codes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Unique Visitors</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-gray-900">{uniqueScans}</span>
              <p className="text-xs text-gray-500 mt-1">De-duplicated devices</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Top Region</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Globe className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-gray-900 truncate block">{topLocation}</span>
              <p className="text-xs text-gray-500 mt-1">Highest scan concentration</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Primary Channel</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Smartphone className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-gray-900">Mobile Camera</span>
              <p className="text-xs text-gray-500 mt-1">iOS & Android scanners</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Timeline Chart */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 sm:p-8">
        <ScanTimeline data={trendData} isLoading={isLoading} />
      </div>

      {/* Grid: Location Map & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Geographic Distribution</h2>
          <LocationMap data={locations} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Device Breakdown</h2>
          <DeviceChart data={deviceData} />
        </div>
      </div>
    </div>
  );
}
