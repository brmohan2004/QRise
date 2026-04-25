'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'

export function MaintenanceToggle() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetch('/api/admin/system/maintenance')
      .then(res => res.json())
      .then(data => {
        setIsEnabled(data.enabled)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const handleToggle = async (checked: boolean) => {
    const confirmMessage = checked 
      ? 'Are you sure you want to ENABLE maintenance mode? This will block all non-admin users.' 
      : 'Disable maintenance mode?'
    
    if (!confirm(confirmMessage)) return

    setIsUpdating(true)
    try {
      const res = await fetch('/api/admin/system/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked }),
      })

      if (!res.ok) throw new Error()
      
      setIsEnabled(checked)
      toast.success(`Maintenance mode ${checked ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to update maintenance mode')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />

  return (
    <div className={`p-4 rounded-2xl border transition-colors ${isEnabled ? 'bg-red-500/10 border-red-500/50' : 'bg-[#0a0a0a] border-[#1a1a1a]'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-red-500/20' : 'bg-[#111]'}`}>
            <AlertTriangle className={`h-5 w-5 ${isEnabled ? 'text-red-500' : 'text-gray-500'}`} />
          </div>
          <div>
            <Label className="text-white font-bold block">Maintenance Mode</Label>
            <p className="text-[10px] text-gray-500 uppercase font-black">
              {isEnabled ? 'Global Access Blocked' : 'Normal Operation'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-red-500" />}
          <Switch 
            checked={isEnabled} 
            onCheckedChange={handleToggle} 
            disabled={isUpdating}
            className="data-[state=checked]:bg-red-500"
          />
        </div>
      </div>
    </div>
  )
}
