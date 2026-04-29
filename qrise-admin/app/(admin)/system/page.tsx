'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { HealthCard } from '@/components/system/health-card'
import { DBStats } from '@/components/system/db-stats'
import { JobQueueMonitor } from '@/components/system/job-queue-monitor'
import { MaintenanceToggle } from '@/components/system/maintenance-toggle'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  RefreshCcw, 
  Activity, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SystemHealthPage() {
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'system_health'],
    queryFn: async () => {
      const start = Date.now()
      const res = await fetch('/api/admin/system/health')
      const end = Date.now()
      setLastRefreshed(new Date())
      const json = await res.json()
      return { ...json, latency: end - start }
    },
    refetchInterval: 30000 // Auto-refresh every 30s
  })

  const anyServiceDown = data?.services && Object.values(data.services).some(status => status === 'down')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Health</h1>
          <p className="text-gray-400">Real-time status monitoring for all platform services and infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
             <p className="text-[10px] font-bold text-gray-500 uppercase">Last Updated</p>
             <p className="text-xs text-gray-400">
               {mounted ? lastRefreshed.toLocaleTimeString() : '--:--:--'}
             </p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-transparent border-[#222] hover:bg-[#111]"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'system_health'] })}
            disabled={isFetching}
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <Skeleton className="h-64 w-full bg-[#111] rounded-3xl" />
           <Skeleton className="h-64 w-full bg-[#111] rounded-3xl" />
           <Skeleton className="h-64 w-full bg-[#111] rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                 <HealthCard services={data.services} />
              </div>
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-[#0a0a0a] border border-blue-500/20 p-6 rounded-3xl h-[200px] flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-500" />
                       </div>
                       <h3 className="text-white font-bold text-lg">System Pulse</h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                       {anyServiceDown 
                         ? "Partial service interruption detected. Some components are responding slower than expected."
                         : "All systems are operating within normal parameters. The global latency average is currently "
                       }
                       <span className={`${data.latency > 500 ? 'text-yellow-500' : 'text-green-500'} font-bold`}>
                         {data.latency}ms
                       </span>.
                    </p>
                 </div>
                 <MaintenanceToggle />
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DBStats stats={data.db} />
              <JobQueueMonitor jobs={data.jobs} />
           </div>

           <div className={`p-4 rounded-2xl flex items-center gap-4 border ${anyServiceDown ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${anyServiceDown ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                 {anyServiceDown 
                   ? <AlertTriangle className="h-5 w-5 text-red-500" />
                   : <CheckCircle2 className="h-5 w-5 text-green-500" />
                 }
              </div>
              <div>
                 <h4 className={`${anyServiceDown ? 'text-red-500' : 'text-green-500'} font-bold text-sm uppercase tracking-tighter`}>
                   {anyServiceDown ? 'Infrastructure Advisory' : 'Infrastructure Stable'}
                 </h4>
                 <p className="text-gray-500 text-xs">
                   {anyServiceDown 
                     ? "Service degradation detected in primary regions. Our engineers are investigating."
                     : "Primary Supabase region (aws-us-east-1) and CF Edge are stable. No active incidents reported."
                   }
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
