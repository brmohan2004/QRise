'use client'

import { StatCard } from '@/components/admin/stat-card'
import { PlatformTrendChart } from '@/components/analytics/platform-trend-chart'
import { GeoBreakdownChart } from '@/components/analytics/geo-breakdown-chart'
import { TopQRsTable } from '@/components/analytics/top-qrs-table'
import { useQuery } from '@tanstack/react-query'
import { Users, QrCode, MousePointer2, Trophy } from 'lucide-react'

export default function DashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'platform_summary'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?view=platform_summary')
      return res.json()
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Overview</h1>
        <p className="text-gray-400">Real-time metrics and system health at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={summary?.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          label="Total QRs"
          value={summary?.totalQRs?.toLocaleString() || '0'}
          icon={QrCode}
          isLoading={isLoading}
        />
        <StatCard
          label="Scans Today"
          value={summary?.scansToday?.toLocaleString() || '0'}
          icon={MousePointer2}
          isLoading={isLoading}
        />
        <StatCard
          label="Active Competitions"
          value={summary?.activeCompetitions || '0'}
          icon={Trophy}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-4 lg:col-span-4">
          <PlatformTrendChart />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <GeoBreakdownChart />
        </div>
      </div>

      <div>
        <TopQRsTable />
      </div>
    </div>
  )
}
