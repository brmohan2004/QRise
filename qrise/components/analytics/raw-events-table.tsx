"use client";

import { Smartphone, Monitor, Tablet, Bot, Shield, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface RawEvent {
  id: string;
  scannedAt: Date;
  countryCode: string;
  deviceType: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
  isUnique: boolean;
  isBot: boolean;
}

interface RawEventsTableProps {
  events: RawEvent[];
  isLoading?: boolean;
}

const deviceIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export function RawEventsTable({ events, isLoading }: RawEventsTableProps) {
  const botCount = events.filter(e => e.isBot).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Scan Events</h3>
        {botCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <Shield className="h-3 w-3 text-amber-600" />
            <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Filtered {botCount} bot scans</span>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Timestamp</th>
                <th className="px-4 py-3 text-left font-bold">Location</th>
                <th className="px-4 py-3 text-left font-bold">Device & OS</th>
                <th className="px-4 py-3 text-center font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y relative">
              {events.map((event) => {
                const DeviceIcon = deviceIcons[event.deviceType] || Smartphone;
                return (
                  <tr key={event.id} className={cn("hover:bg-muted/20 transition-colors", event.isBot && "opacity-50 grayscale")}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">
                        {formatDistanceToNow(new Date(event.scannedAt), { addSuffix: true })}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                        {new Date(event.scannedAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getFlagEmoji(event.countryCode)}</span>
                        <span className="font-bold uppercase tracking-tight">{event.countryCode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-semibold">{event.os} / {event.browser}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {event.isUnique && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded tracking-wider">Unique</span>
                        )}
                        {event.isBot && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-bold uppercase rounded tracking-wider flex items-center gap-1">
                            <Bot className="h-3 w-3" /> Bot
                          </span>
                        )}
                        {!event.isUnique && !event.isBot && (
                           <span className="h-2 w-2 rounded-full bg-gray-200" title="Returning visitor" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Globe className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm font-bold text-muted-foreground">No events recorded yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
