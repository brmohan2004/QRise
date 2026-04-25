'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Sparkles, Calendar as CalendarIcon } from 'lucide-react'

const couponSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9_]+$/, 'Only uppercase letters, numbers, and underscores allowed'),
  description: z.string().optional(),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.number().min(0),
  applies_to_plans: z.array(z.string()).nullable(),
  max_uses: z.number().nullable(),
  valid_from: z.string().nullable(),
  valid_until: z.string().nullable(),
  is_active: z.boolean(),
})

interface CouponFormProps {
  initialData?: Partial<z.infer<typeof couponSchema>> & Record<string, unknown>
  id?: string
}

export function CouponForm({ initialData, id }: CouponFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: initialData || {
      code: '',
      description: '',
      discount_type: 'percent',
      discount_value: 0,
      applies_to_plans: null,
      max_uses: null,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: null,
      is_active: true,
    },
  })

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    form.setValue('code', code)
  }

  async function onSubmit(values: z.infer<typeof couponSchema>) {
    setIsLoading(true)
    try {
      const url = id ? `/api/admin/coupons/${id}` : '/api/admin/coupons'
      const method = id ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) throw new Error('Failed to save coupon')

      toast.success(id ? 'Coupon updated' : 'Coupon created')
      router.push('/coupons')
      router.refresh()
    } catch {
      toast.error('Error saving coupon')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <div className="flex gap-2">
                  <Input 
                    id="code" 
                    placeholder="E.G. SUMMER50" 
                    className="bg-black border-[#222] font-mono uppercase"
                    {...form.register('code', { 
                      onChange: (e) => form.setValue('code', e.target.value.toUpperCase()) 
                    })}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="bg-transparent border-[#222]"
                    onClick={generateCode}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Random
                  </Button>
                </div>
                {form.formState.errors.code && (
                  <p className="text-xs text-red-500">{form.formState.errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Internal Reference)</Label>
                <Textarea 
                  id="description" 
                  placeholder="E.G. 50% discount for summer launch campaign" 
                  className="bg-black border-[#222]"
                  {...form.register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Discount Type</Label>
                  <RadioGroup 
                    // eslint-disable-next-line react-hooks/incompatible-library
                    defaultValue={form.watch('discount_type')} 
                    onValueChange={(val) => form.setValue('discount_type', val as 'percent' | 'fixed')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percent" id="percent" className="border-[#333]" />
                      <Label htmlFor="percent">Percentage (%)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" className="border-[#333]" />
                      <Label htmlFor="fixed">Fixed Amount ($)</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">Discount Value</Label>
                  <Input 
                    id="discount_value" 
                    type="number" 
                    step="0.01"
                    className="bg-black border-[#222]"
                    {...form.register('discount_value', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Availability & Limits</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Maximum Total Uses</Label>
                  <Input 
                    id="max_uses" 
                    type="number" 
                    placeholder="Unlimited"
                    className="bg-black border-[#222]"
                    {...form.register('max_uses', { valueAsNumber: true })}
                  />
                  <p className="text-[10px] text-gray-500">Leave empty for unlimited redemptions.</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-[#222]">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-[10px] text-gray-500">Toggle this coupon on or off.</p>
                  </div>
                  <Switch 
                    checked={form.watch('is_active')} 
                    onCheckedChange={(val: boolean) => form.setValue('is_active', val)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input 
                    id="valid_from" 
                    type="date" 
                    className="bg-black border-[#222]"
                    {...form.register('valid_from')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until (Expiry)</Label>
                  <Input 
                    id="valid_until" 
                    type="date" 
                    className="bg-black border-[#222]"
                    {...form.register('valid_until')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white sticky top-24">
              <CardContent className="p-6 space-y-6">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Coupon Preview</h3>
                 <div className="bg-white text-black p-6 rounded-2xl space-y-4 border-2 border-dashed border-black/10">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-tighter bg-black text-white px-2 py-0.5 rounded">QRise Promo</span>
                       <CalendarIcon className="h-4 w-4 opacity-20" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-3xl font-black italic tracking-tighter">{form.watch('code') || 'YOURCODE'}</h4>
                       <p className="text-xs font-bold text-gray-500">{form.watch('description') || 'Discount for your subscription'}</p>
                    </div>
                    <div className="pt-4 border-t border-black/5 flex items-baseline gap-1">
                       <span className="text-4xl font-black">
                          {form.watch('discount_type') === 'percent' ? `${form.watch('discount_value')}%` : `$${form.watch('discount_value')}`}
                       </span>
                       <span className="text-xs font-bold text-gray-400 uppercase">OFF</span>
                    </div>
                 </div>
                 
                 <Button 
                   type="submit" 
                   disabled={isLoading} 
                   className="w-full bg-white text-black hover:bg-gray-200 font-bold py-6 rounded-xl"
                 >
                   {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   {id ? 'Update Coupon' : 'Create Coupon'}
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </form>
  )
}
