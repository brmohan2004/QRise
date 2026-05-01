'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Edit2, Trash2, Users, Check, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  description?: string
  is_publicly_visible: boolean
  price_monthly: number
  user_count: number
  qr_limit: number
  monthly_scan_limit: number
  has_analytics: boolean
  has_api_access: boolean
  has_bulk_generator: boolean
  has_smart_routing: boolean
  has_password_qr: boolean
  has_multi_action_qr: boolean
  has_design_studio: boolean
  has_form_builder: boolean
  design_studio_logo_limit?: number
  api_call_limit?: number
}

interface PlanCardProps {
  plan: Plan
  index: number
}

export function PlanCard({ plan, index }: PlanCardProps) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)

  // Toggle Public Visibility Mutation
  const toggleMutation = useMutation({
    mutationFn: async (isVisible: boolean) => {
      setIsUpdating(true)
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_publicly_visible: isVisible })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update plan')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      toast.success(`Plan ${plan.name} visibility updated`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      setIsUpdating(false)
    }
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete plan')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      toast.success(`Plan ${plan.name} deleted successfully`)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsDeleting(false)
    }
  })

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isDeleting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [isDeleting, countdown])

  const handleDeleteStart = () => {
    setIsDeleting(true)
    setCountdown(5)
  }

  const handleDeleteCancel = () => {
    setIsDeleting(false)
    setCountdown(0)
  }

  const handleConfirmDelete = () => {
    deleteMutation.mutate()
  }

  return (
    <Card className="bg-[#111] border-[#222] text-white flex flex-col h-full overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-[10px] uppercase border-[#333] text-gray-500">
            Tier {index + 1}
          </Badge>
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-gray-500 uppercase font-bold">Public</span>
             <Switch 
                checked={plan.is_publicly_visible} 
                onCheckedChange={(checked) => toggleMutation.mutate(checked)}
                disabled={isUpdating}
             />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-gray-400 line-clamp-2 min-h-[3rem]">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${plan.price_monthly}</span>
            <span className="text-gray-500 text-sm">/mo</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="h-4 w-4" />
            <span className="text-xs">{plan.user_count} users</span>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Feature Checklist</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              { label: 'Analytics', val: plan.has_analytics },
              { label: 'API Access', val: plan.has_api_access },
              { label: 'Bulk Jobs', val: plan.has_bulk_generator },
              { label: 'Smart Routing', val: plan.has_smart_routing },
              { label: 'Passwords', val: plan.has_password_qr },
              { label: 'Multi-Action', val: plan.has_multi_action_qr },
              { label: 'Design Studio', val: plan.has_design_studio },
              { label: 'Form Builder', val: plan.has_form_builder },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-[11px]">
                {f.val ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                <span className={f.val ? "text-gray-300" : "text-gray-600"}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[#222] grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[9px] uppercase text-gray-500 block">QR Limit</span>
            <span className="text-xs font-bold">{plan.qr_limit === -1 ? 'Unlimited' : plan.qr_limit}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase text-gray-500 block">Scan Limit</span>
            <span className="text-xs font-bold">{plan.monthly_scan_limit === -1 ? 'Unlimited' : plan.monthly_scan_limit}</span>
          </div>
          {plan.has_design_studio && (
            <div className="space-y-1">
              <span className="text-[9px] uppercase text-gray-500 block">Logo Uploads</span>
              <span className="text-xs font-bold">{plan.design_studio_logo_limit || 'All'}</span>
            </div>
          )}
          {plan.has_api_access && (
            <div className="space-y-1">
              <span className="text-[9px] uppercase text-gray-500 block">API Calls</span>
              <span className="text-xs font-bold">{plan.api_call_limit || 'Quota'}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="relative border-t border-[#222] p-4 bg-[#0a0a0a]/50">
        {!isDeleting ? (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" size="sm" className="bg-transparent border-[#333] hover:bg-[#1a1a1a]" asChild>
              <Link href={`/plans/${plan.id}`}>
                <Edit2 className="h-3.5 w-3.5 mr-2" />
                Edit Plan
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteStart}
              className="bg-transparent border-red-900/20 text-red-500 hover:bg-red-900/10" 
              disabled={plan.user_count > 0}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex flex-col w-full gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                Are you sure? This action is permanent.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDeleteCancel}
                className="bg-[#222] border-transparent hover:bg-[#333] text-white"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleConfirmDelete}
                disabled={countdown > 0 || deleteMutation.isPending}
                className={cn(
                   "font-bold uppercase text-[10px] tracking-widest",
                   countdown > 0 && "bg-red-950 text-red-500 border border-red-900/30"
                )}
              >
                {deleteMutation.isPending ? "Deleting..." : (countdown > 0 ? `Wait (${countdown}s)` : "Confirm Delete")}
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
