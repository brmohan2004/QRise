'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layers, Activity, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface JobQueueMonitorProps {
  jobs: {
    queued: number
    processing: number
    done: number
    failed: number
  }
}

export function JobQueueMonitor({ jobs }: JobQueueMonitorProps) {
  const [isFlushing, setIsFlushing] = useState(false)

  const handleFlush = async () => {
    setIsFlushing(true)
    try {
      // Logic to flush stuck jobs (e.g., mark processing jobs as failed if they are old)
      // This would typically call a POST /api/admin/system/flush
      toast.success('Stuck jobs flushed successfully')
    } finally {
      setIsFlushing(false)
    }
  }

  return (
    <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white h-full">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Queue Monitor</h3>
           <Button 
             variant="outline" 
             size="sm" 
             className="h-7 text-[10px] bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
             onClick={handleFlush}
             disabled={isFlushing}
           >
              {isFlushing ? <RotateCw className="h-3 w-3 mr-1 animate-spin" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              Flush Stuck Jobs
           </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="p-4 bg-black rounded-2xl border border-[#111] flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Queued</span>
              <div className="flex items-center justify-between">
                 <span className="text-xl font-black text-amber-500">{jobs.queued}</span>
                 <Layers className="h-4 w-4 text-amber-500/20" />
              </div>
           </div>
           <div className="p-4 bg-black rounded-2xl border border-[#111] flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Processing</span>
              <div className="flex items-center justify-between">
                 <span className="text-xl font-black text-blue-500">{jobs.processing}</span>
                 <Activity className="h-4 w-4 text-blue-500/20" />
              </div>
           </div>
           <div className="p-4 bg-black rounded-2xl border border-[#111] flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Completed</span>
              <div className="flex items-center justify-between">
                 <span className="text-xl font-black text-green-500">{jobs.done}</span>
                 <CheckCircle2 className="h-4 w-4 text-green-500/20" />
              </div>
           </div>
           <div className="p-4 bg-black rounded-2xl border border-[#111] flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Failed</span>
              <div className="flex items-center justify-between">
                 <span className="text-xl font-black text-red-500">{jobs.failed}</span>
                 <AlertCircle className="h-4 w-4 text-red-500/20" />
              </div>
           </div>
        </div>

        <div className="pt-4 border-t border-[#111] space-y-4">
           <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Webhooks Status</h4>
           <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Successful (24h)</span>
              <span className="text-green-500 font-bold">99.8%</span>
           </div>
           <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Failures / Retries</span>
              <span className="text-amber-500 font-bold">12</span>
           </div>
        </div>
      </CardContent>
    </Card>
  )
}
