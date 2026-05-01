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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Activity, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface Delivery {
  id: string
  webhook_id: string
  event_type: string
  response_status: string
  status: 'pending' | 'delivered' | 'failed' | 'retrying' | 'abandoned'
  delivered_at: string
  attempts: number
  duration_ms: number
  webhooks: {
    endpoint_url: string
  }
}

export function DeliveryLogTable() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('/api/admin/webhooks/deliveries')
      if (res.ok) {
        const data = await res.json()
        setDeliveries(data)
      }
    } catch (error) {
      console.error('Failed to fetch deliveries', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchDeliveries();
    };
    load();
    const interval = setInterval(load, 10000); // Refresh every 10s
    return () => { isMounted = false; clearInterval(interval); };
  }, [])

  const getStatusBadge = (status: Delivery['status']) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 uppercase text-[9px] font-black"><CheckCircle2 className="h-3 w-3" /> Success</Badge>
      case 'failed':
      case 'abandoned':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 uppercase text-[9px] font-black"><XCircle className="h-3 w-3" /> Failed</Badge>
      case 'retrying':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 uppercase text-[9px] font-black"><RefreshCw className="h-3 w-3 animate-spin" /> Retrying</Badge>
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20 gap-1 uppercase text-[9px] font-black"><Clock className="h-3 w-3" /> Pending</Badge>
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
    <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white rounded-3xl overflow-hidden mt-6">
      <CardHeader className="p-6 border-b border-[#111]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Real-time Delivery Logs
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Live monitoring of webhook events and delivery attempts.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchDeliveries} className="h-8 text-[10px] uppercase font-black text-gray-500 hover:text-white gap-2">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-[#050505]">
            <TableRow className="border-[#111] hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-6">Event Type</TableHead>
              <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Endpoint</TableHead>
              <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Latency</TableHead>
              <TableHead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right pr-6">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((d) => (
              <TableRow key={d.id} className="border-[#111] hover:bg-[#0d0d0d] transition-colors group">
                <TableCell className="pl-6 py-4">
                  <span className="text-xs font-bold text-gray-200">{d.event_type}</span>
                </TableCell>
                <TableCell>
                   <span className="text-[10px] font-mono text-gray-500 truncate max-w-[200px] block">
                      {d.webhooks?.endpoint_url}
                   </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 items-start">
                    {getStatusBadge(d.status)}
                    {d.response_status && (
                      <span className="text-[9px] font-bold text-gray-600">HTTP {d.response_status}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-mono text-gray-500">
                    {d.duration_ms ? `${d.duration_ms}ms` : '-'}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6 text-xs text-gray-500 tabular-nums">
                  {d.delivered_at ? format(new Date(d.delivered_at), 'HH:mm:ss') : 'Queued'}
                </TableCell>
              </TableRow>
            ))}
            {deliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-gray-500 text-sm">
                  No delivery logs recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
