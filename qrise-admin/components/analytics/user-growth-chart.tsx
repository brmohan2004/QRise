'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

export function UserGrowthChart() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'user_growth'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?view=user_growth')
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
        <CardTitle className="text-lg font-semibold">User Acquisition Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full min-h-[300px] relative">
          {mounted && hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                strokeWidth={2}
              />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-sm italic">No user growth data available for this period</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
