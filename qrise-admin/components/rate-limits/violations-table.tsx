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
import { formatDistanceToNow } from 'date-fns'
import { Loader2, ShieldAlert, Eye, Ban } from 'lucide-react'

interface Violation {
  id: string
  api_key_id: string | null
  user_id: string | null
  ip_address: string | null
  endpoint: string
  violations_count: number
  window_start: string
  auto_action_taken: string
  created_at: string
}

export function ViolationsTable() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchViolations = async () => {
    try {
      const res = await fetch('/api/admin/rate-limits/violations')
      const data = await res.json()
      setViolations(data.violations || [])
    } catch (error) {
      console.error('Failed to fetch violations', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await fetchViolations();
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [])

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'key_disabled':
        return <Badge variant="destructive">Key Disabled</Badge>
      case 'ip_blocked':
        return <Badge className="bg-red-900">IP Blocked</Badge>
      case 'warned':
        return <Badge variant="secondary" className="bg-amber-500">Warned</Badge>
      default:
        return <Badge variant="outline">None</Badge>
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          Recent Rate Limit Violations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Identity</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Violations</TableHead>
              <TableHead>Auto-Action</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs">
                      {v.api_key_id || v.ip_address || v.user_id}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {v.api_key_id ? 'API Key' : v.ip_address ? 'IP Address' : 'User'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-mono text-xs">
                  {v.endpoint}
                </TableCell>
                <TableCell>{v.violations_count}</TableCell>
                <TableCell>{getActionBadge(v.auto_action_taken)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" title="Block IP">
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {violations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No violations recorded in the last 24 hours.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
