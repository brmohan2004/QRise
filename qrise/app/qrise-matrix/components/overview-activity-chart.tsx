"use client";

import React, { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

const DATA_7D = [
  { date: "Mar 10", scans: 120 },
  { date: "Mar 11", scans: 270 },
  { date: "Mar 12", scans: 230 },
  { date: "Mar 13", scans: 320 },
  { date: "Mar 14", scans: 430 },
  { date: "Mar 15", scans: 380 },
  { date: "Mar 16", scans: 580 },
];

const DATA_30D = [
  { date: "Feb 16", scans: 180 },
  { date: "Feb 23", scans: 290 },
  { date: "Mar 02", scans: 340 },
  { date: "Mar 09", scans: 460 },
  { date: "Mar 16", scans: 580 },
];

const DATA_90D = [
  { date: "Jan", scans: 1400 },
  { date: "Feb", scans: 2600 },
  { date: "Mar", scans: 4642 },
];

export function OverviewActivityChart() {
  const [range, setRange] = useState<"7D" | "30D" | "90D">("7D");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = range === "7D" ? DATA_7D : range === "30D" ? DATA_30D : DATA_90D;

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header and Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Project Activity
        </h2>

        {/* 7D | 30D | 90D Selector */}
        <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
          {(["7D", "30D", "90D"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1 rounded-lg transition-all duration-150 text-[11px] font-bold",
                range === r
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-[210px] w-full min-w-0 pt-2 relative">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180} debounce={100}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-slate-800"
              />

              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                ticks={range === "7D" ? [0, 200, 400, 600] : undefined}
                domain={range === "7D" ? [0, 600] : ["auto", "auto"]}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl bg-slate-900 text-white px-3 py-1.5 shadow-lg text-xs font-semibold border border-slate-800">
                        <p className="text-[10px] text-slate-400">{payload[0].payload.date}</p>
                        <p className="text-emerald-400 font-bold">{payload[0].value} scans</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="scans"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#emeraldGradient)"
                dot={{
                  r: 3.5,
                  fill: "#10b981",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: "#059669",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
        )}
      </div>
    </div>
  );
}
