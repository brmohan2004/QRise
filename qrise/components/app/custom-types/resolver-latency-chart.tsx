"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface LatencyData {
  date: string;
  avg_latency_ms: number;
}

interface ResolverLatencyChartProps {
  data: LatencyData[];
  maxTimeoutMs: number;
}

export function ResolverLatencyChart({ data, maxTimeoutMs }: ResolverLatencyChartProps) {
  return (
    <Card className="border-none shadow-sm h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Resolver Latency (Avg)</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              unit="ms"
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="avg_latency_ms" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#latencyGradient)" 
            />
            {/* Threshold Line */}
            <line 
              x1="0" 
              y1={maxTimeoutMs} 
              x2="100%" 
              y2={maxTimeoutMs} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
