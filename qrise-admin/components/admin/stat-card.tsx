import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  delta?: string | number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ElementType
  isLoading?: boolean
}

export function StatCard({ label, value, delta, trend, icon: Icon, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-[#111] border-[#222]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24 bg-[#222]" />
          <Skeleton className="h-4 w-4 rounded-full bg-[#222]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 bg-[#222] mb-1" />
          <Skeleton className="h-3 w-32 bg-[#222]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#111] border-[#222] text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{label}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-gray-500" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(delta || trend) && (
          <p className="text-xs mt-1 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span className={cn(
              trend === 'up' ? "text-green-500" : trend === 'down' ? "text-red-500" : "text-gray-500"
            )}>
              {delta}
            </span>
            <span className="text-gray-500 ml-1">from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
