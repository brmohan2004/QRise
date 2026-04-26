'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  is_enabled: boolean
  enabled_for_plans: string[] | null
}

interface FlagToggleRowProps {
  flag: FeatureFlag
  onUpdate: (updated: FeatureFlag) => void
  onDelete: () => void
}

export function FlagToggleRow({ flag, onUpdate, onDelete }: FlagToggleRowProps) {
  const [isPending, setIsPending] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingValue, setPendingValue] = useState(flag.is_enabled)

  const handleToggle = (checked: boolean) => {
    setPendingValue(checked)
    // If disabling, show confirmation
    if (!checked) {
      setShowConfirm(true)
    } else {
      updateFlag(checked)
    }
  }

  const updateFlag = async (isEnabled: boolean) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/admin/feature-flags/${flag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: isEnabled }),
      })

      if (!res.ok) throw new Error('Failed to update flag')

      const updated = await res.json()
      onUpdate(updated)
      toast.success(`${flag.name} ${isEnabled ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Error updating feature flag')
      // Rollback
      setPendingValue(flag.is_enabled)
    } finally {
      setIsPending(false)
      setShowConfirm(false)
    }
  }

  const getWarningMessage = () => {
    if (flag.key === 'pricing_page_enabled') {
      return "Users will see 'Pricing will roll out soon' instead of the actual pricing page."
    }
    if (flag.key === 'api_docs_enabled') {
      return "Users will see 'We are working on this' instead of the API documentation."
    }
    return "This feature will be hidden for all users regardless of their current plan."
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] hover:border-[#333] transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{flag.name}</span>
            <code className="text-[10px] bg-[#1a1a1a] px-1.5 py-0.5 rounded text-gray-400">{flag.key}</code>
          </div>
          <p className="text-xs text-gray-500 max-w-md">{flag.description}</p>
        </div>

        <div className="flex items-center gap-4">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
          <Switch 
            checked={pendingValue} 
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Disable Confirmation */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-[#0a0a0a] border border-[#222] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Disable Feature Flag?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {getWarningMessage()}
              <br /><br />
              Are you sure you want to disable <strong>{flag.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#222] hover:bg-[#111] text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => updateFlag(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Disable Feature
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-[#0a0a0a] border border-[#222] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Feature Flag?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete the feature flag <strong>{flag.name}</strong> ({flag.key}). 
              Any code relying on this flag will default to being enabled.
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#222] hover:bg-[#111] text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
