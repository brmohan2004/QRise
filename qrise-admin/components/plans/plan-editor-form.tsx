'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const planSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price_monthly: z.number().min(0),
  price_annual: z.number().min(0),
  sort_order: z.number().min(0),
  is_publicly_visible: z.boolean(),
  
  // Feature Flags
  has_analytics: z.boolean(),
  has_api_access: z.boolean(),
  has_bulk_generator: z.boolean(),
  has_design_studio: z.boolean(),
  has_smart_routing: z.boolean(),
  has_password_qr: z.boolean(),
  has_multi_action_qr: z.boolean(),
  has_analytics_export: z.boolean(),
  has_form_builder: z.boolean(),

  // Design Studio Sub-Features
  design_studio_color_limit: z.number().nullable(),
  design_studio_dot_pattern_limit: z.number().nullable(),
  design_studio_logo_limit: z.number().nullable(),
  design_studio_frame_limit: z.number().nullable(),
  design_studio_eye_shape_limit: z.number().nullable(),
  design_studio_eye_color_limit: z.number().nullable(),
  design_studio_frame_color_limit: z.number().nullable(),
  design_studio_style_limit: z.number().nullable(),

  // Smart Routing
  smart_routing_rule_limit: z.number().nullable(),
  smart_routing_geotargeting: z.boolean(),
  smart_routing_devicetargeting: z.boolean(),
  smart_routing_timetargeting: z.boolean(),

  // Limits
  qr_limit: z.number(),
  dynamic_qr_limit: z.number().nullable(),
  static_qr_limit: z.number().nullable(),
  smart_qr_limit: z.number().nullable(),
  monthly_scan_limit: z.number(),
  smart_qr_scan_limit: z.number().nullable(),
  
  api_key_limit: z.number(),
  api_call_limit: z.number().nullable(),
  webhook_limit: z.number(),
  custom_domain_api: z.boolean(),

  password_qr_limit: z.number().nullable(),
  multi_action_qr_limit: z.number().nullable(),
  action_limit: z.number().nullable(),
  bulk_qr_limit: z.number().nullable(),
  bulk_qr_row_limit: z.number().nullable(),

  form_builder_limit: z.number().nullable(),
  form_field_limit: z.number().nullable(),
  form_file_upload_limit: z.number().nullable(),
  form_submission_limit: z.number().nullable(),

  csv_export_limit: z.number().nullable(),
  analytics_export_days: z.number(),
})

interface PlanEditorFormProps {
  initialData?: Partial<z.infer<typeof planSchema>> & Record<string, unknown>
  id?: string
}

export function PlanEditorForm({ initialData, id }: PlanEditorFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      price_monthly: 0,
      price_annual: 0,
      sort_order: 0,
      is_publicly_visible: true,
      has_analytics: false,
      has_api_access: false,
      has_bulk_generator: false,
      has_design_studio: false,
      has_smart_routing: false,
      has_password_qr: false,
      has_multi_action_qr: false,
      has_analytics_export: false,
      has_form_builder: false,
      design_studio_color_limit: null,
      design_studio_dot_pattern_limit: null,
      design_studio_logo_limit: null,
      design_studio_frame_limit: null,
      design_studio_eye_shape_limit: null,
      design_studio_eye_color_limit: null,
      design_studio_frame_color_limit: null,
      design_studio_style_limit: null,
      smart_routing_rule_limit: null,
      smart_routing_geotargeting: false,
      smart_routing_devicetargeting: false,
      smart_routing_timetargeting: false,
      qr_limit: -1,
      dynamic_qr_limit: null,
      static_qr_limit: null,
      smart_qr_limit: null,
      monthly_scan_limit: -1,
      smart_qr_scan_limit: null,
      api_key_limit: 0,
      api_call_limit: null,
      webhook_limit: 0,
      custom_domain_api: false,
      password_qr_limit: null,
      multi_action_qr_limit: null,
      action_limit: null,
      bulk_qr_limit: null,
      bulk_qr_row_limit: null,
      form_builder_limit: null,
      form_field_limit: null,
      form_file_upload_limit: null,
      form_submission_limit: null,
      csv_export_limit: null,
      analytics_export_days: 30,
    },
  })

  async function onSubmit(values: z.infer<typeof planSchema>) {
    setIsLoading(true)
    try {
      const url = id ? `/api/admin/plans/${id}` : '/api/admin/plans'
      const method = id ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        router.push('/plans')
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-black/80 backdrop-blur-md py-4 border-b border-[#222]">
        <div>
          <h2 className="text-xl font-bold text-white">{id ? 'Edit Plan' : 'Create New Plan'}</h2>
          <p className="text-xs text-gray-500">Configure feature access and limits for this tier.</p>
        </div>
        <Button type="submit" disabled={isLoading} className="bg-white text-black hover:bg-gray-200">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basics */}
          <Card className="bg-[#111] border-[#222] text-white">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input id="name" {...form.register('name')} className="bg-[#0a0a0a] border-[#222]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input id="sort_order" type="number" {...form.register('sort_order', { valueAsNumber: true })} className="bg-[#0a0a0a] border-[#222]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...form.register('description')} className="bg-[#0a0a0a] border-[#222]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                  <Input id="price_monthly" type="number" {...form.register('price_monthly', { valueAsNumber: true })} className="bg-[#0a0a0a] border-[#222]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_annual">Annual Price ($)</Label>
                  <Input id="price_annual" type="number" {...form.register('price_annual', { valueAsNumber: true })} className="bg-[#0a0a0a] border-[#222]" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-[#222]">
                <div className="space-y-0.5">
                  <Label>Public Visibility</Label>
                  <p className="text-xs text-gray-500">Show this plan on the public pricing page.</p>
                </div>
                <Switch 
                  checked={form.watch('is_publicly_visible')} 
                  onCheckedChange={(val: boolean) => form.setValue('is_publicly_visible', val)} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Feature Flags & Sub-Controls */}
          <Card className="bg-[#111] border-[#222] text-white">
            <CardHeader>
              <CardTitle className="text-lg">Feature Access & Constraints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'has_analytics', label: 'Advanced Analytics', desc: 'Detailed scan tracking' },
                  { id: 'has_api_access', label: 'API Access', desc: 'REST API & Webhooks' },
                  { id: 'has_bulk_generator', label: 'Bulk Generator', desc: 'CSV to QR batching' },
                  { id: 'has_design_studio', label: 'Design Studio', desc: 'Custom QR styling' },
                  { id: 'has_smart_routing', label: 'Smart Routing', desc: 'Rule-based redirects' },
                  { id: 'has_password_qr', label: 'Password Protection', desc: 'Secure QR access' },
                  { id: 'has_multi_action_qr', label: 'Multi-Action QR', desc: 'Multiple destinations' },
                  { id: 'has_form_builder', label: 'Form Builder', desc: 'Custom data collection' },
                ].map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg border border-[#222]">
                    <div className="space-y-0.5">
                      <Label className="text-sm">{feature.label}</Label>
                      <p className="text-[10px] text-gray-500">{feature.desc}</p>
                    </div>
                    <Switch 
                      // eslint-disable-next-line react-hooks/incompatible-library
                      checked={form.watch(feature.id as keyof z.infer<typeof planSchema>) as boolean} 
                      onCheckedChange={(val: boolean) => form.setValue(feature.id as keyof z.infer<typeof planSchema>, val)} 
                    />
                  </div>
                ))}
              </div>

              {/* Design Studio Sub-Features */}

              {form.watch('has_design_studio') && (
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#222] space-y-4">
                  <h3 className="text-sm font-bold border-b border-[#222] pb-2">Design Studio Constraints</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Color Limit</Label>
                      <Input type="number" {...form.register('design_studio_color_limit', { valueAsNumber: true })} className="h-8 bg-black border-[#222] text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Logo Upload Limit</Label>
                      <Input type="number" {...form.register('design_studio_logo_limit', { valueAsNumber: true })} className="h-8 bg-black border-[#222] text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Style Options Limit</Label>
                      <Input type="number" {...form.register('design_studio_style_limit', { valueAsNumber: true })} className="h-8 bg-black border-[#222] text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Frame Options Limit</Label>
                      <Input type="number" {...form.register('design_studio_frame_limit', { valueAsNumber: true })} className="h-8 bg-black border-[#222] text-xs" />
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Routing Sub-Features */}
              {form.watch('has_smart_routing') && (
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#222] space-y-4">
                  <h3 className="text-sm font-bold border-b border-[#222] pb-2">Smart Routing Controls</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Rule Limit per QR</Label>
                      <Input type="number" {...form.register('smart_routing_rule_limit', { valueAsNumber: true })} className="h-8 bg-black border-[#222] text-xs" />
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <Label className="text-xs">Geotargeting</Label>
                      <Switch checked={form.watch('smart_routing_geotargeting')} onCheckedChange={(v: boolean) => form.setValue('smart_routing_geotargeting', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Device Targeting</Label>
                      <Switch checked={form.watch('smart_routing_devicetargeting')} onCheckedChange={(v: boolean) => form.setValue('smart_routing_devicetargeting', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Time Targeting</Label>
                      <Switch checked={form.watch('smart_routing_timetargeting')} onCheckedChange={(v: boolean) => form.setValue('smart_routing_timetargeting', v)} />
                    </div>
                  </div>
                </div>
              )}

              {/* API Access Sub-Features */}
              {form.watch('has_api_access') && (
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#222] space-y-4">
                  <h3 className="text-sm font-bold border-b border-[#222] pb-2">API & Webhooks</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Monthly API Calls</Label>
                      <Input type="number" {...form.register('api_call_limit', { valueAsNumber: true })} className="h-8 bg-black border-[#222] text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Webhook Endpoints</Label>
                      <Input type="number" {...form.register('webhook_limit', { valueAsNumber: true })} className="h-8 bg-black border-[#222] text-xs" />
                    </div>
                    <div className="flex items-center justify-between col-span-2">
                      <Label className="text-xs">Allow Custom API Domain</Label>
                      <Switch checked={form.watch('custom_domain_api')} onCheckedChange={(v: boolean) => form.setValue('custom_domain_api', v)} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Limits */}
        <div className="space-y-8">
          <Card className="bg-[#111] border-[#222] text-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Usage Quotas
                <Info className="h-4 w-4 text-gray-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr_limit">Total QR Limit (-1 for unlimited)</Label>
                <Input id="qr_limit" type="number" {...form.register('qr_limit', { valueAsNumber: true })} className="bg-[#0a0a0a] border-[#222]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Dynamic Limit</Label>
                  <Input type="number" {...form.register('dynamic_qr_limit', { valueAsNumber: true })} className="h-8 bg-[#0a0a0a] border-[#222]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Smart Limit</Label>
                  <Input type="number" {...form.register('smart_qr_limit', { valueAsNumber: true })} className="h-8 bg-[#0a0a0a] border-[#222]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_scan_limit">Monthly Scan Limit</Label>
                <Input id="monthly_scan_limit" type="number" {...form.register('monthly_scan_limit', { valueAsNumber: true })} className="bg-[#0a0a0a] border-[#222]" />
              </div>
              
              <div className="pt-4 border-t border-[#222] space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Feature Specific Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Password QRs</Label>
                    <Input type="number" {...form.register('password_qr_limit', { valueAsNumber: true })} className="h-8 bg-[#0a0a0a] border-[#222]" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Multi-Action QRs</Label>
                    <Input type="number" {...form.register('multi_action_qr_limit', { valueAsNumber: true })} className="h-8 bg-[#0a0a0a] border-[#222]" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Bulk Jobs/mo</Label>
                    <Input type="number" {...form.register('bulk_qr_limit', { valueAsNumber: true })} className="h-8 bg-[#0a0a0a] border-[#222]" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">CSV Row Limit</Label>
                    <Input type="number" {...form.register('bulk_qr_row_limit', { valueAsNumber: true })} className="h-8 bg-[#0a0a0a] border-[#222]" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#222] space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Form Builder</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Max Forms</Label>
                    <Input type="number" {...form.register('form_builder_limit', { valueAsNumber: true })} className="h-8 bg-[#0a0a0a] border-[#222]" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Submissions/mo</Label>
                    <Input type="number" {...form.register('form_submission_limit', { valueAsNumber: true })} className="h-8 bg-[#0a0a0a] border-[#222]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-[#222] text-white sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 rounded-2xl bg-white text-black space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{form.watch('name') || 'Plan Name'}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{form.watch('description') || 'No description provided.'}</p>
                </div>
                <div className="flex items-baseline gap-1 border-b border-gray-100 pb-4">
                  <span className="text-4xl font-black">${form.watch('price_monthly')}</span>
                  <span className="text-xs font-medium text-gray-500">/ month</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <div className="h-4 w-4 rounded-full bg-black text-white flex items-center justify-center text-[10px]">✓</div>
                    {form.watch('qr_limit') === -1 ? 'Unlimited' : form.watch('qr_limit')} QR Codes
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <div className="h-4 w-4 rounded-full bg-black text-white flex items-center justify-center text-[10px]">✓</div>
                    {form.watch('monthly_scan_limit') === -1 ? 'Unlimited' : form.watch('monthly_scan_limit')} Monthly Scans
                  </div>
                </div>
                <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-xl py-6 font-bold">
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
