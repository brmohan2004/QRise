import React from "react";
import { 
  Barcode, 
  Truck, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";

interface WorkspaceStatsProps {
  totalShipments?: number;
  inTransit?: number;
  delivered?: number;
  totalLabels?: number;
}

export function WorkspaceStats({
  totalShipments = 428,
  inTransit = 156,
  delivered = 210,
  totalLabels = 428,
}: WorkspaceStatsProps) {
  const STATS = [
    {
      id: "total-shipments",
      label: "Total Shipments",
      value: totalShipments,
      trend: "+12%",
      icon: Barcode,
    },
    {
      id: "in-transit",
      label: "In Transit",
      value: inTransit,
      trend: "+8%",
      icon: Truck,
    },
    {
      id: "delivered",
      label: "Delivered",
      value: delivered,
      trend: "+24%",
      icon: CheckCircle2,
    },
    {
      id: "total-labels",
      label: "Total Labels",
      value: totalLabels,
      trend: "+12%",
      icon: Barcode,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 sm:p-4 shadow-sm flex items-start gap-3"
          >
            {/* Icon Box */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
              <Icon className="w-5 h-5 stroke-[1.8]" />
            </div>

            {/* Info */}
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  {stat.value}
                </span>
                <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
