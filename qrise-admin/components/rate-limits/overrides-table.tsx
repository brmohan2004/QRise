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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, UserCog, Key } from 'lucide-react'

interface Override {
  id: string
  name: string
  type: 'key' | 'user'
  identifier: string
  limits: {
    minute: number
    hour: number
    day: number
  }
}

export function OverridesTable() {
  const [overrides, setOverrides] = useState<Override[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOverrides = async () => {
    // In a real app, this would fetch from an API that joins users and api_keys
    // For now, we'll simulate fetching from the api_keys table for keys with overrides
    try {
      const res = await fetch('/api/admin/rate-limits/overrides')
      if (res.ok) {
        const data = await res.json()
        setOverrides(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch overrides', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverrides()
  }, [])

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
          <UserCog className="h-5 w-5" />
          Active Rate Limit Overrides
        </CardTitle>
        <CardDescription>
          Individual overrides set for specific users or API keys.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Identity</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Hr</TableHead>
              <TableHead>Day</TableHead>
              <TableHead className="text-right">Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overrides.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  {o.type === 'key' ? (
                    <Badge variant="outline" className="gap-1">
                      <Key className="h-3 w-3" /> Key
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <UserCog className="h-3 w-3" /> User
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">{o.identifier}</TableCell>
                <TableCell>{o.limits.minute}</TableCell>
                <TableCell>{o.limits.hour}</TableCell>
                <TableCell>{o.limits.day}</TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {o.type === 'key' ? 'API Management' : 'User Detail'}
                </TableCell>
              </TableRow>
            ))}
            {overrides.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No individual overrides active.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
