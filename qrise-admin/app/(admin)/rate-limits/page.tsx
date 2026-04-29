import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RateLimitConfigForm } from '@/components/rate-limits/rate-limit-config-form'
import { ViolationsTable } from '@/components/rate-limits/violations-table'
import { IPBlocksTable } from '@/components/rate-limits/ip-blocks-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldAlert, Ban, Settings, UserCog } from 'lucide-react'
import { OverridesTable } from '@/components/rate-limits/overrides-table'

export default function RateLimitsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Rate Limit Management</h2>
      </div>

      <Tabs defaultValue="violations" className="space-y-4">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="violations" className="gap-2">
            <ShieldAlert className="h-4 w-4" />
            Violations
          </TabsTrigger>
          <TabsTrigger value="ip-blocks" className="gap-2">
            <Ban className="h-4 w-4" />
            IP Blocks
          </TabsTrigger>
          <TabsTrigger value="plan-limits" className="gap-2">
            <Settings className="h-4 w-4" />
            Plan Limits
          </TabsTrigger>
          <TabsTrigger value="overrides" className="gap-2">
            <UserCog className="h-4 w-4" />
            Overrides
          </TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          <ViolationsTable />
        </TabsContent>

        <TabsContent value="ip-blocks" className="space-y-4">
          <IPBlocksTable />
        </TabsContent>

        <TabsContent value="plan-limits" className="space-y-4">
          <RateLimitConfigForm />
        </TabsContent>
        <TabsContent value="overrides" className="space-y-4">
          <OverridesTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
