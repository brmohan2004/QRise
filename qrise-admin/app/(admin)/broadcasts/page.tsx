'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Mail, Calendar, Users, ChevronRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function BroadcastsPage() {
  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ['admin', 'broadcasts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/broadcasts')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch broadcasts')
      }
      return data
    }
  })

  if (broadcasts && 'error' in (broadcasts as any)) {
    return (
      <div className="p-8 text-center border border-red-500/20 bg-red-500/5 rounded-2xl">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Broadcasts</h2>
        <p className="text-gray-400">{(broadcasts as any).error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Email Broadcasts</h1>
          <p className="text-gray-400">View history and manage platform-wide communications.</p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-gray-200 font-bold">
          <Link href="/broadcasts/new">
            <Plus className="h-4 w-4 mr-2" />
            New Broadcast
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-[#111] rounded-2xl" />
          ))
        ) : broadcasts?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#222] rounded-3xl bg-[#050505]">
            <div className="bg-[#111] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-gray-400 font-medium">No broadcasts sent yet</p>
            <p className="text-gray-600 text-sm mt-1">Start by creating your first platform-wide announcement.</p>
            <Button asChild variant="outline" className="mt-6 bg-transparent border-[#222]">
              <Link href="/broadcasts/new">Create First Broadcast</Link>
            </Button>
          </div>
        ) : Array.isArray(broadcasts) ? (
          broadcasts.map((broadcast: { id: string; subject: string; status: string; recipient_count?: number; sent_at?: string }) => (
            <Card key={broadcast.id} className="bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333] transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      broadcast.status === 'sent' ? 'bg-green-500/10 text-green-500' : 
                      broadcast.status === 'sending' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-white transition-colors">{broadcast.subject}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Users className="h-3.5 w-3.5" />
                          <span>{broadcast.recipient_count?.toLocaleString()} recipients</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{broadcast.sent_at ? format(new Date(broadcast.sent_at), 'MMM d, yyyy') : 'Not sent'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <Badge className={`uppercase text-[10px] px-2 py-0.5 rounded-full ${
                      broadcast.status === 'sent' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 
                      broadcast.status === 'sending' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                      'bg-red-500/20 text-red-400 border-red-500/20'
                    }`}>
                      {broadcast.status}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-gray-400 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>

      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4">
        <AlertCircle className="h-6 w-6 text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-blue-200">About Broadcasts</p>
          <p className="text-xs text-blue-200/60 leading-relaxed mt-1">
            Broadcasts allow you to communicate directly with your users. Emails are delivered via Resend. 
            Recipient lists are generated at the time of sending based on your selected segments. 
            For large lists, emails are processed in batches to ensure maximum deliverability.
          </p>
        </div>
      </div>
    </div>
  )
}
