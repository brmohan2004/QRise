'use client'

import { format, differenceInMinutes } from 'date-fns'
import { 
  RefreshCw, 
  XCircle, 
  AlertCircle,
  MoreHorizontal,
  Mail
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { useState } from 'react'
import { toast } from 'sonner'

interface BulkJob {
  id: string
  users?: { email: string }
  total_rows: number
  processed_rows: number
  status: string
  created_at: string
  updated_at: string
}

interface BulkJobsTableProps {
  data: BulkJob[]
  onUpdate: () => void
}

export function BulkJobsTable({ data, onUpdate }: BulkJobsTableProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleAction = async (id: string, action: 'retry' | 'cancel') => {
    setIsProcessing(id)
    try {
      const res = await fetch(`/api/admin/bulk-jobs/${id}/${action}`, {
        method: 'PATCH',
      })

      if (!res.ok) throw new Error(`Failed to ${action} job`)
      toast.success(`Job ${action === 'retry' ? 'reset to queued' : 'cancelled'}`)
      onUpdate()
    } catch {
      toast.error(`Error performing action`)
    } finally {
      setIsProcessing(null)
    }
  }

  const getStatusBadge = (job: BulkJob) => {
    const isStuck = job.status === 'processing' && 
                    differenceInMinutes(new Date(), new Date(job.updated_at)) > 60

    if (isStuck) {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 uppercase text-[10px] animate-pulse">
          <AlertCircle className="h-3 w-3 mr-1" />
          Stuck
        </Badge>
      )
    }

    switch (job.status) {
      case 'queued': return <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20 uppercase text-[10px]">Queued</Badge>
      case 'processing': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase text-[10px]">Processing</Badge>
      case 'done': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 uppercase text-[10px]">Done</Badge>
      case 'failed': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 uppercase text-[10px]">Failed</Badge>
      default: return <Badge variant="outline">{job.status}</Badge>
    }
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden">
      <Table>
        <TableHeader className="bg-[#111]/50">
          <TableRow className="border-[#1a1a1a] hover:bg-transparent">
            <TableHead className="text-gray-400 font-bold">User</TableHead>
            <TableHead className="text-gray-400 font-bold">Progress</TableHead>
            <TableHead className="text-gray-400 font-bold">Status</TableHead>
            <TableHead className="text-gray-400 font-bold">Created At</TableHead>
            <TableHead className="text-gray-400 font-bold">Last Update</TableHead>
            <TableHead className="text-right text-gray-400 font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-20 text-gray-500 font-medium">
                No bulk jobs found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((job) => {
              const progress = Math.round(((job.processed_rows || 0) / job.total_rows) * 100)
              const isStuck = job.status === 'processing' && 
                              differenceInMinutes(new Date(), new Date(job.updated_at)) > 60

              return (
                <TableRow key={job.id} className={`border-[#1a1a1a] hover:bg-[#111]/30 transition-colors ${isStuck ? 'bg-red-500/[0.02]' : ''}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-[#111] flex items-center justify-center text-gray-500">
                          <Mail className="h-4 w-4" />
                       </div>
                       <span className="text-white font-medium text-sm">{job.users?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-48 space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-gray-500">{job.processed_rows || 0} / {job.total_rows}</span>
                          <span className="text-white">{progress}%</span>
                       </div>
                       <Progress value={progress} className="h-1 bg-[#111]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(job)}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs font-medium">
                    {format(new Date(job.created_at), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs font-medium">
                    {format(new Date(job.updated_at), 'HH:mm:ss')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#222] text-white">
                        <DropdownMenuItem 
                          className="focus:bg-[#111] focus:text-white cursor-pointer"
                          onClick={() => handleAction(job.id, 'retry')}
                          disabled={isProcessing === job.id}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 text-blue-500 ${isProcessing === job.id ? 'animate-spin' : ''}`} />
                          Retry / Reset Job
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="focus:bg-[#111] focus:text-white cursor-pointer"
                          onClick={() => handleAction(job.id, 'cancel')}
                          disabled={isProcessing === job.id || job.status === 'done' || job.status === 'failed'}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          Cancel Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
