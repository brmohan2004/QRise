'use client'

import { StatCard } from '@/components/admin/stat-card'
import { ShieldAlert, Ban } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

export function RateLimitWidget() {
  const { data: rlStats, isLoading } = useQuery({
    queryKey: ['admin', 'rate-limits', 'overview'],
    queryFn: async () => {
      const res = await fetch('/api/admin/rate-limits/overview')
      return res.json()
    }
  })

  return (
    <>
      <StatCard
        label="Rate Limit Hits (Today)"
        value={rlStats?.violationsToday?.toLocaleString() || '0'}
        icon={ShieldAlert}
        isLoading={isLoading}
        className={rlStats?.violationsToday > 100 ? 'border-amber-500/50 bg-amber-500/5' : ''}
      />
      <StatCard
        label="Active IP Blocks"
        value={rlStats?.activeBlocks?.toLocaleString() || '0'}
        icon={Ban}
        isLoading={isLoading}
        className={rlStats?.activeBlocks > 0 ? 'border-red-500/50 bg-red-500/5' : ''}
      />
    </>
  )
}
