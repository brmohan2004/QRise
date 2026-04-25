'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { MoreHorizontal, Eye, Ban, Trash2, QrCode } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface QRColumn {
  id: string
  name: string
  type: string
  short_code: string
  scan_count: number
  is_active: boolean
  created_at: string
  users: { email: string }
}

const columns: ColumnDef<QRColumn>[] = [
  {
    accessorKey: 'name',
    header: 'QR Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-[#1a1a1a] rounded-md">
          <QrCode className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{row.getValue('name')}</span>
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
      const isActive = row.getValue('is_active') as boolean
      return (
        <Badge 
          variant="outline" 
          className={isActive 
            ? "bg-green-900/10 text-green-500 border-green-900/20" 
            : "bg-red-900/10 text-red-500 border-red-900/20"
          }
        >
          {isActive ? 'Active' : 'Suspended'}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#1a1a1a] text-gray-400">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#111] border-[#222] text-white">
          <DropdownMenuLabel className="text-gray-500 text-[10px] uppercase font-bold">Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
            <Link href={`/qr-codes/${row.original.id}`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Detail
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-[#1a1a1a] focus:text-white flex items-center gap-2 text-amber-500">
            <Ban className="h-4 w-4" />
            {row.original.is_active ? 'Suspend QR' : 'Activate QR'}
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer focus:bg-red-900/20 focus:text-red-400 flex items-center gap-2 text-red-400">
            <Trash2 className="h-4 w-4" />
            Delete QR
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
]

interface QRCodesTableProps {
  data: QRColumn[]
}

export function QRCodesTable({ data }: QRCodesTableProps) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="name" 
      placeholder="Search by QR name..." 
    />
  )
}
