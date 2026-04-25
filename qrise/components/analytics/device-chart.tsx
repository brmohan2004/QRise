"use client";

import { useState, useEffect } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface DeviceData {
  deviceType: { name: string, value: number }[];
  os: { name: string, value: number }[];
}

const COLORS = ["hsl(var(--primary))", "#14b8a6", "#3b82f6", "#f59e0b", "#6366f1"];

export function DeviceChart({ data }: { data: DeviceData }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[300px] w-full bg-slate-50/50 animate-pulse rounded-xl" />;
  }

  const hasDeviceData = data?.deviceType?.length > 0;
  const hasOsData = data?.os?.length > 0;

  if (!hasDeviceData && !hasOsData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p className="text-sm font-medium">No device data recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Device Type Pie Chart */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Devices</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={300} debounce={100}>
            <PieChart>
              <Pie
                data={data.deviceType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.deviceType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid hsl(var(--border))",
                  fontSize: "12px"
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OS Bar Chart */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Operating Systems</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={300} debounce={100}>
            <BarChart data={data.os} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: "bold" }}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid hsl(var(--border))",
                  fontSize: "12px"
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
