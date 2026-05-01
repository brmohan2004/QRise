'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RevenueTrendChartProps {
  data: { date: string; amount: number }[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [metric, setMetric] = useState('total');

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Date,Amount", ...data.map(d => `${d.date},${d.amount}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `revenue_trend_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="col-span-4 bg-[#111] border-[#222] text-white">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <CardTitle className="text-xl font-bold">Revenue Dynamics</CardTitle>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setMetric('total')}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                metric === 'total' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Gross Revenue
            </button>
            <button 
              onClick={() => setMetric('new')}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                metric === 'new' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              New Subscriptions
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-[#1a1a1a] border-[#333] text-gray-300 rounded-xl h-9">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#333] text-gray-300">
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportCSV}
            className="rounded-xl border-[#333] bg-[#1a1a1a] text-gray-300 hover:bg-[#222] h-9"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[380px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 11 }}
                dy={10}
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 11 }}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                labelStyle={{ color: '#999', marginBottom: '4px' }}
                formatter={(value: unknown) => [`$${Number(value || 0).toLocaleString()}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#revenueGradient)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

