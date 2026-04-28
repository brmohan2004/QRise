'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { NotificationHistoryTable } from '@/components/notifications/notification-history-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Bell, Mail, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: async () => {
      const res = await fetch('/api/admin/notifications')
      return res.json()
    }
  })

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success('Notification deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    } catch {
      toast.error('Error deleting notification')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Notification Center</h1>
          <p className="text-gray-400">Manage targeted alerts, push notifications, and support emails.</p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-gray-200 font-bold">
          <Link href="/notifications/new">
            <Plus className="h-4 w-4 mr-2" />
            Send Notification
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-[#1a1a1a] flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-500" />
           </div>
           <div>
              <p className="text-[10px] uppercase text-gray-500 font-black tracking-tighter">Support Emails</p>
              <p className="text-2xl font-bold text-white">{data?.total || 0}</p>
           </div>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-[#1a1a1a] flex items-center gap-4">
           <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Bell className="h-6 w-6 text-amber-500" />
           </div>
           <div>
              <p className="text-[10px] uppercase text-gray-500 font-black tracking-tighter">Push Alerts</p>
              <p className="text-2xl font-bold text-white">0</p>
           </div>
        </div>
        <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-[#1a1a1a] flex items-center gap-4">
           <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-green-500" />
           </div>
           <div>
              <p className="text-[10px] uppercase text-gray-500 font-black tracking-tighter">Delivery Rate</p>
              <p className="text-2xl font-bold text-white">99.2%</p>
           </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-[#111]" />
          <Skeleton className="h-[400px] w-full bg-[#111] rounded-2xl" />
        </div>
      ) : (
        <NotificationHistoryTable 
          data={data?.data || []} 
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
