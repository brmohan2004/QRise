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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow, isAfter } from 'date-fns'
import { Loader2, Unlock, AlertTriangle, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface IPBlock {
  id: string
  ip_address: string
  reason: string
  block_type: 'temporary' | 'permanent'
  expires_at: string | null
  created_at: string
  unblocked_at: string | null
}

export function IPBlocksTable() {
  const [blocks, setBlocks] = useState<IPBlock[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBlocks = async () => {
    try {
      const res = await fetch('/api/admin/rate-limits/ip-blocks')
      const data = await res.json()
      setBlocks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch IP blocks', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlocks()
  }, [])

  const unblockIP = async (id: string, ip: string) => {
    if (!confirm(`Are you sure you want to unblock ${ip}?`)) return

    try {
      const res = await fetch(`/api/admin/rate-limits/ip-blocks?id=${id}&ip=${ip}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success(`IP ${ip} unblocked successfully`)
        fetchBlocks()
      } else {
        toast.error('Failed to unblock IP')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Active IP Blocks
        </CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Block IP
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP Address</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map((b) => {
              const isExpired = b.expires_at && !isAfter(new Date(b.expires_at), new Date())
              const isUnblocked = !!b.unblocked_at
              const isActive = !isExpired && !isUnblocked

              return (
                <TableRow 
                  key={b.id}
                  className={!isActive ? 'opacity-50 grayscale' : ''}
                >
                  <TableCell className="font-mono font-medium">
                    {b.ip_address}
                    {!isActive && (
                      <span className="ml-2 text-[10px] text-muted-foreground uppercase">
                        ({isUnblocked ? 'Unblocked' : 'Expired'})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px] text-sm italic">
                    "{b.reason}"
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.block_type === 'permanent' ? 'destructive' : 'secondary'}>
                      {b.block_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {b.expires_at 
                      ? formatDistanceToNow(new Date(b.expires_at), { addSuffix: true })
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    {isActive && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => unblockIP(b.id, b.ip_address)}
                      >
                        <Unlock className="h-4 w-4" />
                        Unblock
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {blocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No active IP blocks.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
