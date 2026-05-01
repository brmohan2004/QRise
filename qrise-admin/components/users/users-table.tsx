'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/admin/data-table'
import { UserPlanBadge } from './user-plan-badge'
import { UserActionsMenu } from './user-actions-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Copy, Check } from 'lucide-react'

interface UserColumn {
  id: string
  full_name: string | null
  email: string
  plan: string
  qr_count: number
  scan_count: number
  created_at: string
  is_suspended: boolean
  avatar_url: string | null
}

const CopyIdCell = ({ id }: { id: string }) => {
  const [copied, setCopied] = React.useState(false)

  const onCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <span className="text-[10px] font-mono text-gray-600 truncate max-w-[50px] uppercase" title={id}>
        {id.split('-')[0]}...
      </span>
      <button 
        onClick={onCopy}
        className="p-1 rounded hover:bg-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3 text-gray-600 hover:text-gray-400" />
        )}
      </button>
    </div>
  )
}

const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: 'full_name',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-[#222]">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback className="bg-[#1a1a1a] text-gray-500">
              {user.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{user.full_name || 'No Name'}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <CopyIdCell id={row.original.id} />
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) => <UserPlanBadge plan={row.getValue('plan')} />
  },
  {
    accessorKey: 'qr_count',
    header: 'QRs',
    cell: ({ row }) => <span className="text-sm font-mono text-gray-400">{row.getValue('qr_count')}</span>
  },
  {
    accessorKey: 'scan_count',
    header: 'Scans',
    cell: ({ row }) => <span className="text-sm font-mono text-gray-400">{((row.getValue('scan_count') as number) ?? 0).toLocaleString()}</span>
  },
  {
    accessorKey: 'created_at',
    header: 'Joined',
    cell: ({ row }) => (
      <span className="text-xs text-gray-500">
        {format(new Date(row.getValue('created_at')), 'MMM d, yyyy')}
      </span>
    )
  },
  {
    accessorKey: 'is_suspended',
    header: 'Status',
    cell: ({ row }) => {
      const isSuspended = row.getValue('is_suspended') as boolean
      return (
        <Badge 
          variant="outline" 
          className={isSuspended 
            ? "bg-red-900/10 text-red-500 border-red-900/20" 
            : "bg-green-900/10 text-green-500 border-green-900/20"
          }
        >
          {isSuspended ? 'Suspended' : 'Active'}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <UserActionsMenu 
        userId={row.original.id} 
        isSuspended={row.original.is_suspended} 
      />
    )
  }
]

interface UsersTableProps {
  data: UserColumn[]
}

export function UsersTable({ data }: UsersTableProps) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="full_name" 
      placeholder="Search users by name..." 
    />
  )
}
