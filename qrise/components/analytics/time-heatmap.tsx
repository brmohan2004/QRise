"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface HeatmapData {
  day: number; // 0-6
  hour: number; // 0-23
  count: number;
}

interface TimeHeatmapProps {
  data: HeatmapData[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [0, 6, 12, 18, 23];

export function TimeHeatmap({ data }: TimeHeatmapProps) {
  const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

  const peakDayHour = useMemo(() => {
    if (data.length === 0) return null;
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const peak = sorted[0];
    return `${DAYS[peak.day === 0 ? 6 : peak.day - 1]}s at ${peak.hour}:00`;
  }, [data]);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Scan Times (UTC)</h3>
      
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12 shrink-0" />
            <div className="flex-1 flex justify-between px-1">
              {HOURS.map(h => (
                <span key={h} className="text-[10px] font-bold text-muted-foreground">{h}:00</span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-2">
                <span className="w-12 text-xs font-bold text-muted-foreground">{day}</span>
                <div className="flex-1 grid grid-cols-24 gap-1">
                  {Array.from({ length: 24 }).map((_, hourIndex) => {
                    // Match with data (Handle JS 0=Sunday)
                    const jsDay = dayIndex === 6 ? 0 : dayIndex + 1;
                    const cellData = data.find(d => d.day === jsDay && d.hour === hourIndex);
                    const count = cellData?.count || 0;
                    const opacity = count > 0 ? Math.max(0.1, count / maxCount) : 0;

                    return (
                      <div 
                        key={hourIndex}
                        className="aspect-square rounded-[2px] bg-primary group relative transition-all hover:ring-2 hover:ring-primary hover:z-10"
                        style={{ opacity }}
                        title={`${day} ${hourIndex}:00 — ${count} scans`}
                      >
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
                           {count} scans
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {peakDayHour && (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <p className="font-medium">
            Peak activity typically occurs on <span className="font-bold text-primary">{peakDayHour}</span>.
          </p>
        </div>
      )}
    </div>
  );
}
