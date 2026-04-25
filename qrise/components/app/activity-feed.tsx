"use client";

import Link from "next/link";
import { Smartphone, Monitor, Tablet, Globe, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export interface RecentActivity {
  id: string;
  qrId: string;
  qrName: string;
  countryCode: string;
  deviceType: "mobile" | "tablet" | "desktop";
  scannedAt: Date;
}

interface ActivityFeedProps {
  events: RecentActivity[];
  isLoading?: boolean;
}

const deviceIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export function ActivityFeed({ events, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 border rounded-xl animate-pulse">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl">
        <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-full mb-4">
          <Globe className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">No scans yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
          Share your QR codes to get started tracking scans.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const Icon = deviceIcons[event.deviceType] || Smartphone;
        return (
          <div 
            key={event.id} 
            className="flex items-center gap-4 p-3 pr-4 border rounded-xl bg-card hover:bg-muted/30 transition-colors group"
          >
            <div className="w-10 h-10 bg-primary/5 text-primary flex items-center justify-center rounded-xl border border-primary/10">
              <span className="text-lg" title={event.countryCode}>
                {getFlagEmoji(event.countryCode)}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <Link 
                href={`/qr-codes/${event.qrId}/analytics`}
                className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors hover:underline"
              >
                {event.qrName}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  {event.deviceType}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(event.scannedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <div className="shrink-0">
              <div className="h-5 w-5 bg-muted rounded-full flex items-center justify-center">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
