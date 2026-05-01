'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, ExternalLink, Globe, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Webhook {
  id: string
  endpoint_url: string
  events: string[]
  is_active: boolean
  created_at: string
  users: {
    email: string
    full_name: string
  }
}

export function WebhookList() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/admin/webhooks')
      if (res.ok) {
        const data = await res.json()
        setWebhooks(data)
      }
    } catch (error) {
      console.error('Failed to fetch webhooks', error)
      toast.error('Failed to load webhooks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchWebhooks();
    };
    load();
    return () => { isMounted = false; };
  }, [])

  const toggleWebhook = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      })
      if (res.ok) {
        setWebhooks(prev => prev.map(w => w.id === id ? { ...w, is_active: !currentStatus } : w))
        toast.success(`Webhook ${!currentStatus ? 'activated' : 'deactivated'}`)
      }
    } catch (_error) {
      toast.error('Failed to update webhook')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white rounded-3xl overflow-hidden">
      <CardHeader className="p-6 border-b border-[#111]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Active Webhook Subscriptions
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Manage global webhook endpoints and their subscription statuses.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            {webhooks.length} Total Endpoints
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-[#050505]">
            <TableRow className="border-[#111] hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-6">Endpoint & User</TableHead>
              <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Events</TableHead>
              <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right pr-6">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((w) => (
              <TableRow key={w.id} className="border-[#111] hover:bg-[#0d0d0d] transition-colors group">
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono text-gray-300 flex items-center gap-2">
                      {w.endpoint_url}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                      {w.users?.full_name || 'Unknown User'} ({w.users?.email})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {w.events.slice(0, 3).map(e => (
                      <Badge key={e} variant="secondary" className="text-[9px] bg-gray-500/10 text-gray-400 border-none font-bold">
                        {e}
                      </Badge>
                    ))}
                    {w.events.length > 3 && (
                      <Badge variant="secondary" className="text-[9px] bg-gray-500/10 text-gray-400 border-none font-bold">
                        +{w.events.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={w.is_active} 
                      onCheckedChange={() => toggleWebhook(w.id, w.is_active)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${w.is_active ? 'text-blue-500' : 'text-gray-600'}`}>
                      {w.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6 text-xs text-gray-500 tabular-nums">
                  {format(new Date(w.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
            {webhooks.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Activity className="h-12 w-12 text-gray-800" />
                    <p className="text-gray-500 text-sm font-medium">No webhook subscriptions found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
