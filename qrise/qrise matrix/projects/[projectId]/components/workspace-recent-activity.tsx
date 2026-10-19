import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Truck, 
  MapPin, 
  Package, 
  CheckCircle2 
} from "lucide-react";

interface ActivityEvent {
  id: string;
  dotColor: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  trackingId: string;
  location: string;
  timestamp: string;
}

const EVENTS: ActivityEvent[] = [
  {
    id: "ev-1",
    dotColor: "bg-emerald-500",
    icon: Truck,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "Shipment in transit",
    trackingId: "CR-10025",
    location: "Arrived at Chennai sorting facility",
    timestamp: "10:42 AM",
  },
  {
    id: "ev-2",
    dotColor: "bg-slate-300 dark:bg-slate-600",
    icon: MapPin,
    iconBg: "bg-blue-50 dark:bg-blue-950/60",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Shipment dispatched",
    trackingId: "CR-10024",
    location: "Dispatched from warehouse",
    timestamp: "10:20 AM",
  },
  {
    id: "ev-3",
    dotColor: "bg-slate-300 dark:bg-slate-600",
    icon: Package,
    iconBg: "bg-purple-50 dark:bg-purple-950/60",
    iconColor: "text-purple-600 dark:text-purple-400",
    title: "Shipment received",
    trackingId: "CR-10023",
    location: "Received at warehouse",
    timestamp: "09:48 AM",
  },
  {
    id: "ev-4",
    dotColor: "bg-slate-300 dark:bg-slate-600",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "Shipment delivered",
    trackingId: "CR-10022",
    location: "Delivered to recipient",
    timestamp: "Yesterday",
  },
];

export function WorkspaceRecentActivity() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Recent Activity
        </h2>
        <Link
          href="#activity"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Timeline Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm">
        <div className="relative pl-6 space-y-5">
          {/* Vertical Connecting Line */}
          <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

          {EVENTS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative flex items-center justify-between gap-3">
                {/* Status Dot */}
                <span className={`absolute -left-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${item.dotColor} ring-4 ring-white dark:ring-slate-900`} />

                {/* Left Icon + Text Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.trackingId}</span>
                      <span className="mx-1">·</span>
                      {item.location}
                    </p>
                  </div>
                </div>

                {/* Right Timestamp */}
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                  {item.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
