"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StatusSegment {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

const STATUSES: StatusSegment[] = [
  { label: "In Transit", count: 156, percentage: 36, color: "#10b981" },
  { label: "Delivered", count: 210, percentage: 49, color: "#059669" },
  { label: "Pending Dispatch", count: 42, percentage: 10, color: "#3b82f6" },
  { label: "Delivery Exception", count: 12, percentage: 3, color: "#f97316" },
  { label: "Returned", count: 8, percentage: 2, color: "#94a3b8" },
];

export function ShipmentStatusChart() {
  const total = 428;

  // Calculate SVG stroke dashes for the donut chart
  // Circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.3
  const circumference = 251.3;
  let accumulatedOffset = 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Shipment Status
        </h2>
        <Link
          href="#labels"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 pt-1">
        {/* Donut Chart with Center Text */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {STATUSES.map((item) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedOffset;
              accumulatedOffset += (item.percentage / 100) * circumference;

              return (
                <circle
                  key={item.label}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {total}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Legend Breakdown Table */}
        <div className="flex-1 w-full space-y-2">
          {STATUSES.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs font-medium"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-right">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 w-8">
                  {item.count}
                </span>
                <span className="text-slate-400 w-8 text-right font-semibold">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
