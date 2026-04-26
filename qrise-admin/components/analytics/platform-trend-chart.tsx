'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

export function PlatformTrendChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'scans_trend'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?view=scans_trend')
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch')
      }
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <Card className="bg-[#111] border-[#222]">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-[#222]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full bg-[#222]" />
        </CardContent>
      </Card>
    )
  }

  const chartData = Array.isArray(data) ? data : []
  const hasData = chartData.length > 0

  return (
    <Card className="bg-[#111] border-[#222] text-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Platform Scan Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-center justify-center" style={{ minWidth: 0 }}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#444" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(str) => {
                  const date = new Date(str)
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }}
              />
              <YAxis 
                stroke="#444" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#fff" 
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-sm italic">No scan data available for this period</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
