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

const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

export function DeviceChart({ data }: { data: DeviceData }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[300px] w-full bg-gray-50/50 animate-pulse rounded-2xl border border-gray-100" />;
  }

  const hasDeviceData = data?.deviceType?.length > 0;
  const hasOsData = data?.os?.length > 0;

  if (!hasDeviceData && !hasOsData) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No device data recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
      {/* Device Type Pie Chart */}
      <div className="space-y-6">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Devices</h3>
          <p className="text-xs text-gray-400 mt-1">Platform distribution</p>
        </div>
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <PieChart>
              <Pie
                data={data.deviceType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.deviceType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "16px", 
                  border: "1px solid #f1f5f9",
                  fontSize: "11px",
                  fontWeight: "700",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={40} 
                iconType="circle" 
                wrapperStyle={{ 
                  fontSize: '9px', 
                  fontWeight: '900', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em',
                  color: '#94a3b8'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OS Bar Chart */}
      <div className="space-y-6">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Operating Systems</h3>
          <p className="text-xs text-gray-400 mt-1">Software distribution</p>
        </div>
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <BarChart data={data.os} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: "16px", 
                  border: "1px solid #f1f5f9",
                  fontSize: "11px",
                  fontWeight: "700",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
              />
              <Bar dataKey="value" fill="#059669" radius={[0, 8, 8, 0]} barSize={24} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
