'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Loader2, Globe, Trophy } from 'lucide-react'

const competitionSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  prize_details: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  registration_deadline: z.string(),
  max_participants: z.number().nullable(),
  is_public: z.boolean(),
  is_registration_open: z.boolean(),
})

interface CompetitionFormProps {
  initialData?: Partial<z.infer<typeof competitionSchema>> & Record<string, unknown>
  id?: string
}

export function CompetitionForm({ initialData, id }: CompetitionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof competitionSchema>>({
    resolver: zodResolver(competitionSchema),
    defaultValues: initialData || {
      title: '',
      slug: '',
      description: '',
      prize_details: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      max_participants: null,
      is_public: false,
      is_registration_open: true,
    },
  })

  // Auto-slug
  // eslint-disable-next-line react-hooks/incompatible-library
  const title = form.watch('title')
  useEffect(() => {
    if (!id && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      form.setValue('slug', slug)
    }
  }, [title, id, form])

  async function onSubmit(values: z.infer<typeof competitionSchema>) {
    setIsLoading(true)
    try {
      const url = id ? `/api/admin/competitions/${id}` : '/api/admin/competitions'
      const method = id ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) throw new Error('Failed to save competition')

      toast.success(id ? 'Competition updated' : 'Competition created')
      if (!id) {
        const data = await res.json()
        router.push(`/competitions/${data.id}`)
      }
      router.refresh()
    } catch {
      toast.error('Error saving competition')
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
                <Label htmlFor="title">Competition Title</Label>
                <Input id="title" placeholder="e.g. Summer QR Design Hackathon" className="bg-black border-[#222]" {...form.register('title')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">qrise.io/competitions/</span>
                  <Input id="slug" placeholder="summer-hackathon" className="bg-black border-[#222] font-mono h-8 text-xs" {...form.register('slug')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea id="description" placeholder="Explain the theme and goals..." className="bg-black border-[#222] min-h-[150px]" {...form.register('description')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prize_details" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Prize Details
                </Label>
                <Textarea id="prize_details" placeholder="What can participants win?" className="bg-black border-[#222]" {...form.register('prize_details')} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Timelines & Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Start Date</Label>
                  <Input type="date" className="bg-black border-[#222] text-xs h-9" {...form.register('start_date')} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">End Date</Label>
                  <Input type="date" className="bg-black border-[#222] text-xs h-9" {...form.register('end_date')} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Registration Deadline</Label>
                  <Input type="date" className="bg-black border-[#222] text-xs h-9" {...form.register('registration_deadline')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input id="max_participants" type="number" placeholder="Unlimited" className="bg-black border-[#222]" {...form.register('max_participants', { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Visibility</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-[#222]">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Public Status</Label>
                    <p className="text-[10px] text-gray-500">Live on the public site.</p>
                  </div>
                  <Switch checked={form.watch('is_public')} onCheckedChange={(v: boolean) => form.setValue('is_public', v)} />
                </div>
                <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-[#222]">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Registration</Label>
                    <p className="text-[10px] text-gray-500">Allow new signups.</p>
                  </div>
                  <Switch checked={form.watch('is_registration_open')} onCheckedChange={(v: boolean) => form.setValue('is_registration_open', v)} />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-white text-black hover:bg-gray-200 font-bold py-6 rounded-xl">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {id ? 'Update Competition' : 'Create Competition'}
              </Button>

              {id && (
                <Button asChild variant="outline" className="w-full bg-transparent border-[#222] text-gray-400">
                  <a href={`https://qrise.io/competitions/${form.watch('slug')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                    <Globe className="h-4 w-4" />
                    View Public Page
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
