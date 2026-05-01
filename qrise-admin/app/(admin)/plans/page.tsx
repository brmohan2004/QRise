'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Edit2, Trash2, Users, Check, X, Plus } from 'lucide-react'
import Link from 'next/link'
import { PlanCard } from '@/components/plans/plan-card'

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

export default function PlansPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const res = await fetch('/api/admin/plans')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[500px] w-full bg-[#111] rounded-2xl border border-[#222]" />)}
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-widest">Subscription Plans</h1>
          <p className="text-gray-500 text-sm mt-1">Define pricing, feature access, and usage quotas for QRise tiers.</p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-xl shadow-white/5">
          <Link href="/plans/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Link>
        </Button>
      </div>

      {!Array.isArray(plans) ? (
        <div className="p-4 bg-red-900/10 border border-red-900/20 text-red-400 rounded-xl flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <p className="font-bold text-xs uppercase tracking-widest">{plans?.error || 'Failed to load plans.'}</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-[#111] border border-[#222] rounded-3xl border-dashed">
          <div className="bg-[#222] p-6 rounded-full mb-6">
            <Plus className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Subscription Plans Found</h3>
          <p className="text-gray-500 mb-8 max-w-sm">
            You haven't created any subscription plans yet. Create your first plan to start offering different tiers to your users.
          </p>
          <Button asChild className="bg-[#222] text-white hover:bg-[#333] font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-xl">
            <Link href="/plans/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: any, index: number) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
