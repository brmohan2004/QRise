'use client'

import { Card, CardContent } from '@/components/ui/card'
import { HardDrive, Share2, Table as TableIcon } from 'lucide-react'

interface DBStatsProps {
  stats: {
    size: string
    active_connections: number
    row_counts: Record<string, number>
  }
}

export function DBStats({ stats }: DBStatsProps) {
  return (
    <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
      <CardContent className="p-6 space-y-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Database Metrics</h3>
        
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 bg-black rounded-2xl border border-[#111] space-y-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                 <HardDrive className="h-3 w-3" />
                 <span className="text-[10px] font-bold uppercase tracking-tighter">Total Size</span>
              </div>
              <span className="text-2xl font-black">{stats.size}</span>
           </div>
           <div className="p-4 bg-black rounded-2xl border border-[#111] space-y-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                 <Share2 className="h-3 w-3" />
                 <span className="text-[10px] font-bold uppercase tracking-tighter">Connections</span>
              </div>
              <span className="text-2xl font-black">{stats.active_connections}</span>
           </div>
        </div>

        <div className="space-y-3">
           <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Row Counts</h4>
           <div className="space-y-2">
              {Object.entries(stats.row_counts).map(([table, count]) => (
                 <div key={table} className="flex items-center justify-between py-2 border-b border-[#111] last:border-0">
                    <div className="flex items-center gap-2">
                       <TableIcon className="h-3 w-3 text-gray-600" />
                       <span className="text-xs text-gray-400 font-mono">{table}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{count.toLocaleString()}</span>
                 </div>
              ))}
           </div>
        </div>
      </CardContent>
    </Card>
  )
}
