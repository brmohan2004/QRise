'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { HardDrive, Share2, Table as TableIcon, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface DBStatsProps {
  stats: {
    size: string
    active_connections: number
    row_counts: Record<string, number>
  }
}

export function DBStats({ stats }: DBStatsProps) {
  const queryClient = useQueryClient()
  const [isCleaning, setIsCleaning] = useState<string | null>(null)
  const [confirmTable, setConfirmTable] = useState<string | null>(null)

  const handleClean = async (table: string) => {
    setIsCleaning(table)
    try {
      const res = await fetch('/api/admin/system/db/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to clean table')
      }

      toast.success(`Table ${table} cleaned successfully`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'system_health'] })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsCleaning(null)
      setConfirmTable(null)
    }
  }

  return (
    <>
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
                   <div key={table} className="flex items-center justify-between py-2 border-b border-[#111] last:border-0 group">
                      <div className="flex items-center gap-2">
                         <TableIcon className="h-3 w-3 text-gray-600" />
                         <span className="text-xs text-gray-400 font-mono">{table}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-xs font-bold text-white">{count.toLocaleString()}</span>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-7 w-7 text-gray-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                           onClick={() => setConfirmTable(table)}
                           disabled={isCleaning === table}
                         >
                           {isCleaning === table ? (
                             <Loader2 className="h-3.5 w-3.5 animate-spin" />
                           ) : (
                             <Trash2 className="h-3.5 w-3.5" />
                           )}
                         </Button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!confirmTable}
        onClose={() => setConfirmTable(null)}
        onConfirm={() => confirmTable && handleClean(confirmTable)}
        title={`Clean table: ${confirmTable}?`}
        description={`This will permanently delete all records from the '${confirmTable}' table. This action cannot be undone.`}
        confirmText="Clean All Data"
        variant="danger"
        isLoading={isCleaning === confirmTable}
      />
    </>
  )
}
