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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface PlanConfig {
  plan_name: string
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
}

export function RateLimitConfigForm() {
  const [configs, setConfigs] = useState<PlanConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/admin/rate-limits/config')
      const data = await res.json()
      setConfigs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch configs', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await fetchConfigs();
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [])

  const handleUpdate = async (plan: string, updates: Partial<PlanConfig>) => {
    setSaving(plan)
    const config = configs.find(c => c.plan_name === plan)
    if (!config) return

    try {
      const res = await fetch('/api/admin/rate-limits/config', {
        method: 'PATCH',
        body: JSON.stringify({ ...config, ...updates }),
      })
      if (res.ok) {
        toast.success(`Limits for ${plan} updated`)
        fetchConfigs()
      } else {
        toast.error('Failed to update limits')
      }
    } catch (_error) {
      toast.error('An error occurred')
    } finally {
      setSaving(null)
    }
  }

  const handleChange = (plan: string, field: keyof PlanConfig, value: string) => {
    setConfigs(prev => prev.map(c => 
      c.plan_name === plan ? { ...c, [field]: parseInt(value) || 0 } : c
    ))
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
        <CardTitle>Plan Limits</CardTitle>
        <CardDescription>
          Adjust global rate limits for each subscription tier.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Per Minute</TableHead>
              <TableHead>Per Hour</TableHead>
              <TableHead>Per Day</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((c) => (
              <TableRow key={c.plan_name}>
                <TableCell className="font-bold uppercase">{c.plan_name}</TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={c.requests_per_minute}
                    onChange={(e) => handleChange(c.plan_name, 'requests_per_minute', e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={c.requests_per_hour}
                    onChange={(e) => handleChange(c.plan_name, 'requests_per_hour', e.target.value)}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={c.requests_per_day}
                    onChange={(e) => handleChange(c.plan_name, 'requests_per_day', e.target.value)}
                    className="w-32"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleUpdate(c.plan_name, {})}
                    disabled={saving === c.plan_name}
                  >
                    {saving === c.plan_name ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
