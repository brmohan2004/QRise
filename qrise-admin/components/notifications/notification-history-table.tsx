'use client'

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Bell, Trash2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'email' | 'push'
  subject: string
  body: string
  target_type: string
  recipient_count: number
  status: string
  sent_at: string | null
  created_at: string
}

interface NotificationHistoryTableProps {
  data: Notification[]
  onDelete: (id: string) => void
}

export function NotificationHistoryTable({ data, onDelete }: NotificationHistoryTableProps) {
  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] overflow-hidden">
      <Table>
        <TableHeader className="bg-[#111]">
          <TableRow className="border-[#1a1a1a] hover:bg-transparent">
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Type</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Subject / Content</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Target</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Audience</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Status</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Date</TableHead>
            <TableHead className="text-right text-gray-400 font-bold uppercase text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-20 text-gray-500 italic">
                No notification history found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((notification) => (
              <TableRow key={notification.id} className="border-[#111] hover:bg-white/[0.02]">
                <TableCell>
                  {notification.type === 'email' ? (
                    <Mail className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Bell className="h-4 w-4 text-amber-500" />
                  )}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <div className="font-bold text-white truncate">{notification.subject || 'No Subject'}</div>
                  <div className="text-[10px] text-gray-500 truncate">{notification.body}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px] uppercase border-[#222] text-gray-400">
                    {notification.target_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-300">
                  {notification.recipient_count} users
                </TableCell>
                <TableCell>
                  <Badge className={`text-[9px] uppercase ${
                    notification.status === 'sent' ? 'bg-green-500/10 text-green-500' :
                    notification.status === 'draft' ? 'bg-gray-500/10 text-gray-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {notification.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {format(new Date(notification.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white" asChild>
                       <Link href={`/notifications/${notification.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                       </Link>
                    </Button>
                    {notification.status === 'draft' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                        onClick={() => onDelete(notification.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
