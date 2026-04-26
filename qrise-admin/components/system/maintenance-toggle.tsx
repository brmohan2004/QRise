'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { ConfirmDialog } from '@/components/admin/confirm-dialog'

export function MaintenanceToggle() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingValue, setPendingValue] = useState(false)

  useEffect(() => {
    fetch('/api/admin/system/maintenance')
      .then(res => res.json())
      .then(data => {
        setIsEnabled(data.enabled)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const handleToggle = (checked: boolean) => {
    setPendingValue(checked)
    setShowConfirm(true)
  }

  const confirmToggle = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch('/api/admin/system/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: pendingValue }),
      })

      if (!res.ok) throw new Error()
      
      setIsEnabled(pendingValue)
      toast.success(`Maintenance mode ${pendingValue ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to update maintenance mode')
    } finally {
      setIsUpdating(false)
      setShowConfirm(false)
    }
  }

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />

  return (
    <>
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

      <ConfirmDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmToggle}
        title={pendingValue ? "Enable Maintenance Mode?" : "Disable Maintenance Mode?"}
        description={pendingValue 
          ? "This will immediately block all non-administrative users from accessing any part of the platform. Active sessions will be interrupted."
          : "This will restore public access to all users. Ensure the system is stable before proceeding."
        }
        confirmText={pendingValue ? "Enable Now" : "Restore Access"}
        variant={pendingValue ? "danger" : "info"}
        isLoading={isUpdating}
      />
    </>
  )
}
