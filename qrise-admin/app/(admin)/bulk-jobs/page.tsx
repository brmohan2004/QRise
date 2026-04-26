'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BulkJobsTable } from '@/components/bulk-jobs/bulk-jobs-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  RefreshCcw,
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Activity
} from 'lucide-react'
import { useState } from 'react'

export default function BulkJobsPage() {
  const queryClient = useQueryClient()
  const [autoRefresh, setAutoRefresh] = useState(true)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'bulk_jobs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/bulk-jobs')
      return res.json()
    },
    refetchInterval: autoRefresh ? 5000 : false // Refresh every 5s if active
  })

  // Stats calculation
  const stats = {
    total: data?.total || 0,
    processing: data?.data?.filter((j: { status: string }) => j.status === 'processing').length || 0,
    queued: data?.data?.filter((j: { status: string }) => j.status === 'queued').length || 0,
    failed: data?.data?.filter((j: { status: string }) => j.status === 'failed').length || 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Bulk Jobs Monitor</h1>
          <p className="text-gray-400">Monitor and recover system-wide QR code generation jobs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
             <div className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
             <span className="text-[10px] font-bold text-gray-500 uppercase">Auto-Refresh</span>
             <input 
               type="checkbox" 
               checked={autoRefresh} 
               onChange={(e) => setAutoRefresh(e.target.checked)}
               className="ml-1"
             />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-[#111] border-[#333] hover:border-white/50 transition-all text-white"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'bulk_jobs'] })}
            disabled={isFetching}
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : 'text-blue-400'}`} />
          </Button>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-3xl space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase">Active Jobs</p>
            <div className="flex items-center justify-between">
               <span className="text-3xl font-black text-white">{stats.processing}</span>
               <Activity className="h-6 w-6 text-blue-500" />
            </div>
         </div>
         <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-3xl space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase">In Queue</p>
            <div className="flex items-center justify-between">
               <span className="text-3xl font-black text-white">{stats.queued}</span>
               <Clock className="h-6 w-6 text-amber-500" />
            </div>
         </div>
         <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-3xl space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase">Failed Today</p>
            <div className="flex items-center justify-between">
               <span className="text-3xl font-black text-white">{stats.failed}</span>
               <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
         </div>
         <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-3xl space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase">Total Completed</p>
            <div className="flex items-center justify-between">
               <span className="text-3xl font-black text-white">{stats.total - stats.failed - stats.processing - stats.queued}</span>
               <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
         </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
           <Skeleton className="h-10 w-full bg-[#111] rounded-xl" />
           <Skeleton className="h-96 w-full bg-[#111] rounded-3xl" />
        </div>
      ) : (
        <BulkJobsTable 
          data={data?.data || []} 
          onUpdate={() => queryClient.invalidateQueries({ queryKey: ['admin', 'bulk_jobs'] })} 
        />
      )}
    </div>
  )
}
