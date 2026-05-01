'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ban, UserCheck, Trash2, UserCog, Settings, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'

interface Plan {
  id: string
  name: string
  price_monthly: number
}

interface UserActionsPanelProps {
  userId: string
  isSuspended: boolean
  currentPlanName?: string
}

export function UserActionsPanel({ userId, isSuspended, currentPlanName }: UserActionsPanelProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [activeDialog, setActiveDialog] = useState<'suspend' | 'delete' | 'impersonate' | 'plan' | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  useEffect(() => {
    if (activeDialog === 'plan') {
      fetch('/api/admin/plans')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPlans(data)
            // Find current plan ID from name
            const current = data.find(p => p.name.toLowerCase() === currentPlanName?.toLowerCase())
            if (current) setSelectedPlanId(current.id)
          }
        })
    }
  }, [activeDialog, currentPlanName])

  const handleImpersonate = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/impersonate`, { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        toast.success('Starting impersonation session...')
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to impersonate')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to impersonate')
    } finally {
      setIsLoading(false)
      setActiveDialog(null)
    }
  }

  const handleToggleSuspension = async () => {
    setIsLoading(true)
    const action = isSuspended ? 'unsuspend' : 'suspend'
    try {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, { method: 'POST' })
      if (!res.ok) throw new Error(`Failed to ${action} user`)
      
      toast.success(`User account ${isSuspended ? 'unsuspended' : 'suspended'} successfully`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setActiveDialog(null)
    }
  }

  const handlePlanChange = async () => {
    if (!selectedPlanId) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlanId })
      })
      
      if (!res.ok) throw new Error('Failed to update subscription plan')
      
      toast.success('User plan updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setActiveDialog(null)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      })
      if (!res.ok) throw new Error('Failed to delete user&apos;s account')
      
      toast.success('User account deleted permanently')
      router.push('/users')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setIsLoading(false)
      setActiveDialog(null)
    }
  }

  return (
    <>
      <Card className="bg-[#111] border-[#222] text-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Administrative Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 bg-transparent border-[#222] hover:bg-[#1a1a1a]"
            onClick={() => setActiveDialog('impersonate')}
            disabled={isLoading}
          >
            <UserCog className="h-4 w-4" />
            Impersonate User
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 bg-transparent border-[#222] hover:bg-[#1a1a1a]"
            onClick={() => setActiveDialog('plan')}
            disabled={isLoading}
          >
            <Settings className="h-4 w-4" />
            Modify Subscription Plan
          </Button>

          <div className="pt-2 border-t border-[#222] space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 bg-transparent border-[#222] hover:bg-amber-900/10 hover:text-amber-500 hover:border-amber-900/20"
              onClick={() => setActiveDialog('suspend')}
              disabled={isLoading}
            >
              {isSuspended ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  Lift Suspension
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  Suspend Account
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 bg-transparent border-red-900/20 text-red-500 hover:bg-red-900/20"
              onClick={() => setActiveDialog('delete')}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
              Permanently Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modify Plan Dialog */}
      <Dialog open={activeDialog === 'plan'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Subscription Plan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Change the user&apos;s current plan and associated limits.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedPlanId === plan.id 
                  ? 'border-blue-500 bg-blue-500/5' 
                  : 'border-[#222] hover:border-[#333]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{plan.name}</span>
                    {plan.name.toLowerCase() === currentPlanName?.toLowerCase() && (
                      <Badge className="bg-gray-800 text-[9px] uppercase">Current</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">${plan.price_monthly}/mo</p>
                </div>
                {selectedPlanId === plan.id && <Check className="h-4 w-4 text-blue-500" />}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActiveDialog(null)}
              className="bg-transparent border-[#222] hover:bg-[#111]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePlanChange}
              disabled={isLoading || plans.find(p => p.id === selectedPlanId)?.name.toLowerCase() === currentPlanName?.toLowerCase()}
              className="bg-white text-black hover:bg-gray-200"
            >
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        isOpen={activeDialog === 'impersonate'}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleImpersonate}
        title="Start Impersonation?"
        description="You are about to log in as this user. All actions taken will be performed as them, but logged under your admin audit trail."
        confirmText="Start Session"
        variant="info"
        isLoading={isLoading}
      />

      <ConfirmDialog 
        isOpen={activeDialog === 'suspend'}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleToggleSuspension}
        title={isSuspended ? "Lift Suspension?" : "Suspend Account?"}
        description={isSuspended 
          ? "This will restore the user's access to the platform and reactivate their QR codes."
          : "This will immediately block the user's access and disable all of their active QR codes. They will receive an email notification."
        }
        confirmText={isSuspended ? "Unsuspend Account" : "Confirm Suspension"}
        variant="warning"
        isLoading={isLoading}
      />

      <ConfirmDialog 
        isOpen={activeDialog === 'delete'}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleDelete}
        title="Permanently Delete Account?"
        description="DANGER: This action cannot be undone. This will permanently delete the user's account, all their QR codes, and anonymize their scan data."
        confirmText="Delete Permanently"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  )
}
