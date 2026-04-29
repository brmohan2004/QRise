
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { HardDrive, Share2, Table as TableIcon, Trash2, Loader2, Database, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  const [showAllTables, setShowAllTables] = useState(false)

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

  const tableEntries = Object.entries(stats.row_counts).sort((a, b) => a[0].localeCompare(b[0]))
  const totalTables = tableEntries.length
  const previewTables = tableEntries.slice(0, 4)

  return (
    <>
      <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white rounded-3xl overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Database Metrics</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
               <Database className="h-3 w-3 text-blue-500" />
               <span className="text-[10px] font-bold text-blue-400 uppercase">{totalTables} Tables</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-gradient-to-br from-black to-[#050505] rounded-2xl border border-[#111] space-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                   <HardDrive className="h-12 w-12 text-blue-500" />
                </div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                   <HardDrive className="h-3 w-3" />
                   <span className="text-[10px] font-bold uppercase tracking-tighter">Total Size</span>
                </div>
                <span className="text-2xl font-black">{stats.size}</span>
             </div>
             <div className="p-4 bg-gradient-to-br from-black to-[#050505] rounded-2xl border border-[#111] space-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Share2 className="h-12 w-12 text-emerald-500" />
                </div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                   <Share2 className="h-3 w-3" />
                   <span className="text-[10px] font-bold uppercase tracking-tighter">Connections</span>
                </div>
                <span className="text-2xl font-black">{stats.active_connections}</span>
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Core Tables</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1 uppercase font-bold tracking-tighter"
                  onClick={() => setShowAllTables(true)}
                >
                   View All <ChevronRight className="h-3 w-3" />
                </Button>
             </div>
             <div className="space-y-1">
                {previewTables.map(([table, count]) => (
                   <div key={table} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#0d0d0d] transition-colors group">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-gray-500/5 flex items-center justify-center group-hover:bg-gray-500/10 transition-colors">
                            <TableIcon className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                         </div>
                         <span className="text-xs text-gray-400 font-mono group-hover:text-gray-200 transition-colors">{table}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-xs font-bold text-white tabular-nums">{count.toLocaleString()}</span>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8 text-gray-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
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

      <Dialog open={showAllTables} onOpenChange={setShowAllTables}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 rounded-3xl">
          <DialogHeader className="p-6 border-b border-[#111] flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                Database Explorer
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-1">Full inventory of system tables and row counts</p>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tableEntries.map(([table, count]) => (
                <div key={table} className="flex items-center justify-between p-3 rounded-xl bg-black border border-[#111] hover:border-blue-500/20 transition-all group">
                   <div className="flex items-center gap-3">
                      <TableIcon className="h-3.5 w-3.5 text-gray-700" />
                      <span className="text-xs text-gray-400 font-mono">{table}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 tabular-nums">{count.toLocaleString()}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-700 hover:text-red-500 hover:bg-red-500/10 group-hover:opacity-100 transition-all"
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
          
          <div className="p-4 bg-[#050505] border-t border-[#111] flex justify-end">
            <Button 
              variant="outline" 
              className="bg-transparent border-[#222] hover:bg-[#111] rounded-xl text-xs uppercase font-bold tracking-widest"
              onClick={() => setShowAllTables(false)}
            >
              Close Explorer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
