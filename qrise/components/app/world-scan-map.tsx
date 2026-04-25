"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface WorldScanMapProps {
  data: { country: string; count: number; code: string }[];
}

export function WorldScanMap({ data }: WorldScanMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sort data by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  if (!isMounted) {
    return (
      <Card className="h-full shadow-sm border-muted/60">
        <CardHeader className="flex flex-row items-center justify-between pb-7">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Top Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-slate-50/50 animate-pulse rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm border-muted/60">
      <CardHeader className="flex flex-row items-center justify-between pb-7">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Top Locations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={300} debounce={100}>
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="country"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: "bold", fill: "hsl(var(--foreground))" }}
                width={100}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 100,
                  padding: "8px 12px"
                }}
                itemStyle={{ color: "black", fontWeight: "bold" }}
                labelStyle={{ display: "none" }}
                wrapperStyle={{ zIndex: 1000 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`hsl(var(--primary) / ${Math.max(0.2, 1 - index * 0.1)})`} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
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
