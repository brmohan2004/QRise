'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

export function GeoBreakdownChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'geo'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?view=geo')
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
        <CardTitle className="text-lg font-semibold">Geographic Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis type="number" stroke="#444" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#444" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                width={80}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: '#222' }}
              />
              <Bar dataKey="value" fill="#fff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 text-sm italic">No geographic data available</div>
        )}
        </div>
      </CardContent>
    </Card>
  )
}
