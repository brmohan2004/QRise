'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Edit2, Trash2, Users, Check, X, Plus } from 'lucide-react'
import Link from 'next/link'

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
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 w-full bg-[#111]" />)}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Subscription Plans</h1>
          <p className="text-gray-400">Define pricing, feature access, and usage quotas for QRise tiers.</p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-gray-200">
          <Link href="/plans/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Link>
        </Button>
      </div>

      {!Array.isArray(plans) ? (
        <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-md">
          {plans?.error || 'Failed to load plans.'}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-[#111] border border-[#222] rounded-lg">
          <div className="bg-[#222] p-4 rounded-full mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Subscription Plans Found</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            You haven't created any subscription plans yet. Create your first plan to start offering different tiers to your users.
          </p>
          <Button asChild className="bg-white text-black hover:bg-gray-200">
            <Link href="/plans/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan: Plan, index: number) => (
          <Card key={plan.id} className="bg-[#111] border-[#222] text-white flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px] uppercase border-[#333] text-gray-500">
                  Tier {index + 1}
                </Badge>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-gray-500 uppercase font-bold">Public</span>
                   <Switch checked={plan.is_publicly_visible} disabled />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-gray-400 line-clamp-2">{plan.description}</CardDescription>
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
            <CardFooter className="grid grid-cols-2 gap-2 border-t border-[#222] pt-4">
              <Button variant="outline" size="sm" className="bg-transparent border-[#333] hover:bg-[#1a1a1a]" asChild>
                <Link href={`/plans/${plan.id}`}>
                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                  Edit Plan
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent border-red-900/20 text-red-500 hover:bg-red-900/10" disabled={plan.user_count > 0}>
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}
    </div>
  )
}
