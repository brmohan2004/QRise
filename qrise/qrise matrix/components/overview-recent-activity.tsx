import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ChevronRight, 
  FileText, 
  Truck 
} from "lucide-react";

interface ActivityItem {
  id: string;
  dotColor: string;
  icon: React.ElementType;
  title: string;
  highlight: string;
  timeAgo: string;
  href: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    dotColor: "bg-emerald-500",
    icon: FileText,
    title: "Label created",
    highlight: "CR-10025",
    timeAgo: "2 minutes ago",
    href: "/qrise-matrix/projects",
  },
  {
    id: "act-2",
    dotColor: "bg-slate-400 dark:bg-slate-500",
    icon: Truck,
    title: "Shipment status updated",
    highlight: "In Transit",
    timeAgo: "28 minutes ago",
    href: "/qrise-matrix/projects",
  },
];

export function OverviewRecentActivity() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Recent Activity
        </h2>
        <Link 
          href="/qrise-matrix/projects"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Timeline Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm">
        <div className="relative pl-6 space-y-6">
          {/* Vertical Connecting Line */}
          <div className="absolute left-2.5 top-3.5 bottom-3.5 w-0.5 bg-slate-200 dark:bg-slate-800" />

          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.id}
                href={act.href}
                className="group relative flex items-center justify-between transition-all"
              >
                {/* Status Dot */}
                <span className={`absolute -left-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${act.dotColor} ring-4 ring-white dark:ring-slate-900`} />

                {/* Content */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
                      {act.title} <span className="font-normal text-slate-400 dark:text-slate-500 mx-1">·</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{act.highlight}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                      {act.timeAgo}
                    </p>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
