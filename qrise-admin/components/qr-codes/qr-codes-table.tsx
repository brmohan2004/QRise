'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { MoreHorizontal, Eye, Ban, Trash2, QrCode, Loader2 } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Layers } from 'lucide-react'

interface QRColumn {
  id: string
  name: string
  type: string
  short_code: string
  scan_count: number
  is_active: boolean
  status: string
  created_at: string
  users: { email: string }
  is_batch?: boolean
  qr_count?: number
}

interface QRCodesTableProps {
  data: QRColumn[]
}

export function QRCodesTable({ data }: QRCodesTableProps) {
  const queryClient = useQueryClient()

  const toggleStatus = useMutation({
    mutationFn: async ({ id, is_active, is_batch }: { id: string, is_active: boolean, is_batch?: boolean }) => {
      const endpoint = is_batch ? `/api/admin/bulk-jobs/${id}/status` : `/api/admin/qr-codes/${id}`
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !is_active })
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'qr_codes'] })
    }
  })

  const deleteQR = useMutation({
    mutationFn: async ({ id, is_batch }: { id: string, is_batch?: boolean }) => {
      const endpoint = is_batch ? `/api/admin/bulk-jobs/${id}` : `/api/admin/qr-codes/${id}`
      const res = await fetch(endpoint, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'qr_codes'] })
    }
  })

  const columns: ColumnDef<QRColumn>[] = [
    {
      accessorKey: 'name',
      header: 'QR Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#1a1a1a] rounded-md">
            {row.original.is_batch ? (
              <Layers className="h-4 w-4 text-emerald-500" />
            ) : (
              <QrCode className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{row.getValue('name')}</span>
              {row.original.is_batch && (
                <Badge className="h-4 px-1 text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  {row.original.qr_count} QRs
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{row.original.short_code}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'users.email',
      header: 'Owner',
      cell: ({ row }) => <span className="text-sm text-gray-400">{row.original.users?.email}</span>
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] uppercase border-[#333] text-gray-400">
          {row.getValue('type')}
        </Badge>
      )
    },
    {
      accessorKey: 'scan_count',
      header: 'Scans',
      cell: ({ row }) => <span className="text-sm font-mono text-gray-400">{((row.getValue('scan_count') as number) ?? 0).toLocaleString()}</span>
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {format(new Date(row.getValue('created_at')), 'MMM d, yyyy')}
        </span>
      )
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const status = (row.original.status || (row.original.is_active ? 'active' : 'suspended')) as string
        return (
          <Badge 
            variant="outline" 
            className={status === 'active' 
              ? "bg-green-900/10 text-green-500 border-green-900/20" 
              : status === 'suspended'
                ? "bg-amber-900/10 text-amber-500 border-amber-900/20"
                : "bg-red-900/10 text-red-500 border-red-900/20"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const qr = row.original
        const isToggling = toggleStatus.isPending && toggleStatus.variables?.id === qr.id
        const isDeleting = deleteQR.isPending && deleteQR.variables === qr.id

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#1a1a1a] text-gray-400">
                {(isToggling || isDeleting) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#111] border-[#222] text-white">
              <DropdownMenuLabel className="text-gray-500 text-[10px] uppercase font-bold">Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
                <Link href={qr.is_batch ? `/bulk-jobs/${qr.id}` : `/qr-codes/${qr.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-[#1a1a1a] focus:text-white flex items-center gap-2 text-amber-500"
                onClick={() => toggleStatus.mutate({ id: qr.id, is_active: qr.is_active, is_batch: qr.is_batch })}
                disabled={isToggling || isDeleting}
              >
                <Ban className="h-4 w-4" />
                {qr.is_active ? (qr.is_batch ? 'Suspend Batch' : 'Suspend QR') : (qr.is_batch ? 'Activate Batch' : 'Activate QR')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-red-900/20 focus:text-red-400 flex items-center gap-2 text-red-400"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete this ${qr.is_batch ? 'batch' : 'QR code'}? This action cannot be undone.`)) {
                    deleteQR.mutate({ id: qr.id, is_batch: qr.is_batch })
                  }
                }}
                disabled={isToggling || isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete QR
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="name" 
      placeholder="Search by QR name..." 
    />
  )
}

