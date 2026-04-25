"use client";

import { Card, CardContent } from "@/components/ui/card";
import { WorldScanMap } from "@/components/app/world-scan-map";

interface LocationData {
  country: string;
  code: string;
  count: number;
}

interface LocationMapProps {
  data: LocationData[];
  isLoading?: boolean;
}

export function LocationMap({ data, isLoading }: LocationMapProps) {
  const totalScans = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-[450px]">
        <WorldScanMap data={data} />
      </div>
      
      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Country Breakdown</h3>
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Country</th>
                <th className="px-4 py-3 text-right font-bold">Scans</th>
                <th className="px-4 py-3 text-right font-bold">%</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.sort((a, b) => b.count - a.count).map((item) => (
                <tr key={item.code} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <span className="text-lg">{getFlagEmoji(item.code)}</span>
                    <span className="font-medium truncate max-w-[150px]">{item.country}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">{item.count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground font-medium">
                    {totalScans > 0 ? ((item.count / totalScans) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="py-20 text-center text-muted-foreground font-medium">
              No location data available yet.
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Approximate location based on IP geolocation.
        </p>
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
