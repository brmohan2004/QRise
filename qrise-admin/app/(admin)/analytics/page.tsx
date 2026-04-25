'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlatformTrendChart } from '@/components/analytics/platform-trend-chart'
import { GeoBreakdownChart } from '@/components/analytics/geo-breakdown-chart'
import { TopQRsTable } from '@/components/analytics/top-qrs-table'
import { DeviceSplitChart } from '@/components/analytics/device-split-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MousePointer2, Users, QrCode, Globe } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Analytics</h1>
        <p className="text-gray-400">In-depth analysis of platform usage, user growth, and geographic trends.</p>
      </div>

      <Tabs defaultValue="scans" className="space-y-6">
        <TabsList className="bg-[#111] border border-[#222] p-1 h-12">
          <TabsTrigger value="scans" className="data-[state=active]:bg-[#222] data-[state=active]:text-white gap-2">
            <MousePointer2 className="h-4 w-4" />
            Scans
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#222] data-[state=active]:text-white gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="qrs" className="data-[state=active]:bg-[#222] data-[state=active]:text-white gap-2">
            <QrCode className="h-4 w-4" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger value="geo" className="data-[state=active]:bg-[#222] data-[state=active]:text-white gap-2">
            <Globe className="h-4 w-4" />
            Geography
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2">
              <PlatformTrendChart />
            </div>
            <DeviceSplitChart />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-[#111] border-[#222] text-white">
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Reuse trend chart with user data if needed, or implement a separate one */}
              <p className="text-gray-500 text-sm">User acquisition trends visualization coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrs" className="space-y-6">
          <TopQRsTable />
        </TabsContent>

        <TabsContent value="geo" className="space-y-6">
          <GeoBreakdownChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
