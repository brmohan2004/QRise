'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

const COLORS = ['#ffffff', '#a3a3a3', '#525252', '#262626']

export function DeviceSplitChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'devices'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?view=devices')
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

  return (
    <Card className="bg-[#111] border-[#222] text-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Device Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative">
          <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data?.map((entry: Record<string, unknown>, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
