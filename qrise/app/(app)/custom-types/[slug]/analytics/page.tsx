"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ResolverHealthCards } from "@/components/app/custom-types/resolver-health-cards";
import { ResolverLatencyChart } from "@/components/app/custom-types/resolver-latency-chart";
import { ResolverCallsTable } from "@/components/app/custom-types/resolver-calls-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ResolverAnalyticsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [range, setRange] = useState("7d");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["resolver-analytics", slug, range],
    queryFn: async () => {
      const res = await fetch(`/api/v1/types/${slug}/analytics?range=${range}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return (await res.json()).data;
    }
  });

  return (
    <div className="space-y-10 p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href="/developer?tab=custom-types" 
            className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-colors tracking-widest"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to Types
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-[1.25rem] text-primary">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900">
                {slug} <span className="text-primary/40">Analytics</span>
              </h1>
            </div>
            <p className="text-gray-500 font-medium text-lg ml-16">
              Real-time health and performance data for your custom type resolver.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100">
          {["24h", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                range === r 
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {r}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl hover:bg-white"
          >
            <RefreshCw className={cn("h-4 w-4 text-gray-400", isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-[2rem]" />)}
        </div>
      ) : data ? (
        <>
          <ResolverHealthCards summary={data.summary} />
          
          <div className="grid grid-cols-1 gap-10">
            <ResolverLatencyChart 
              data={data.by_day} 
              maxTimeoutMs={3000} // This should ideally come from plan limits
            />
            
            <ResolverCallsTable calls={data.recent_calls} />
          </div>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No data available for this period</p>
        </div>
      )}
    </div>
  );
}
