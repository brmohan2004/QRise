'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Users, DollarSign } from 'lucide-react'

interface CouponStats {
  total_redemptions: number
  redemptions_this_month: number
  total_discount_value: number
  recent_redemptions: Record<string, unknown>[]
}

export function CouponStatsCard({ stats }: { stats: CouponStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Total Uses</p>
            <p className="text-xl font-black">{stats.total_redemptions}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">This Month</p>
            <p className="text-xl font-black">{stats.redemptions_this_month}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Value Saved</p>
            <p className="text-xl font-black">${stats.total_discount_value.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
