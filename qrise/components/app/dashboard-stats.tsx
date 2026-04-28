"use client";

import { QrCode, MousePointer2, Activity, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "./stat-card";

export function DashboardStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 30000, // 30 seconds
  });

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="col-span-full p-8 rounded-xl border border-red-200 bg-red-50 text-center">
          <p className="text-red-600 font-medium">Failed to load stats. Please refresh.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <StatCard
        label="Total QR Codes"
        value={data?.totalQRs || 0}
        delta={data?.deltas?.totalQRs}
        deltaDirection="up"
        icon={QrCode}
        isLoading={isLoading}
      />
      <StatCard
        label="Total Scans"
        value={data?.totalScans || 0}
        delta={data?.deltas?.totalScans}
        deltaDirection="up"
        icon={MousePointer2}
        isLoading={isLoading}
      />
      <StatCard
        label="Active QR Codes"
        value={data?.activeQRs || 0}
        delta={data?.deltas?.activeQRs}
        deltaDirection="neutral"
        icon={Zap}
        isLoading={isLoading}
      />
      <StatCard
        label="Scans Today"
        value={data?.scansToday || 0}
        delta={data?.deltas?.scansToday}
        deltaDirection="up"
        icon={Activity}
        isLoading={isLoading}
      />
    </div>
  );
}
