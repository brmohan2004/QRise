'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trophy, Calendar, Users, Settings2, Globe } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Competition {
  id: string
  title: string
  slug: string
  is_public: boolean
  start_date: string
  end_date: string
  registrations?: { id: string }[]
}

export default function CompetitionsPage() {
  const queryClient = useQueryClient()
  
  const { data: competitions, isLoading } = useQuery({
    queryKey: ['admin', 'competitions'],
    queryFn: async () => {
      const res = await fetch('/api/admin/competitions')
      return res.json()
    }
  })

  const handleStatusToggle = async (id: string, isPublic: boolean) => {
    try {
      const res = await fetch(`/api/admin/competitions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: isPublic }),
      })
      if (!res.ok) throw new Error('Failed to update')
      
      toast.success(isPublic ? 'Competition is now LIVE' : 'Competition moved to DRAFT')
      queryClient.invalidateQueries({ queryKey: ['admin', 'competitions'] })
    } catch {
      toast.error('Error updating competition')
    }
  }

  const getStatusBadge = (comp: Competition) => {
    const now = new Date()
    const start = new Date(comp.start_date)
    const end = new Date(comp.end_date)
    
    if (!comp.is_public) return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/10 text-[9px] uppercase">Draft</Badge>
    if (now < start) return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/10 text-[9px] uppercase">Upcoming</Badge>
    if (now > end) return <Badge className="bg-red-500/10 text-red-500 border-red-500/10 text-[9px] uppercase">Ended</Badge>
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/10 text-[9px] uppercase">Live</Badge>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Competitions</h1>
          <p className="text-gray-400">Manage hackathons, challenges, and public registration events.</p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-gray-200 font-bold">
          <Link href="/competitions/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Competition
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-[#111] rounded-3xl" />
          ))
        ) : competitions?.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-[#1a1a1a] rounded-[40px] bg-[#050505]">
            <div className="bg-[#111] w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-gray-700" />
            </div>
            <p className="text-gray-300 font-bold text-xl">No competitions yet</p>
            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">Engage your community with design challenges and hackathons.</p>
            <Button asChild className="mt-8 bg-white text-black hover:bg-gray-200 font-bold px-8">
              <Link href="/competitions/new">Launch First Challenge</Link>
            </Button>
          </div>
        ) : (
          competitions?.map((comp: Competition) => (
            <Card key={comp.id} className="bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333] transition-all group rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="p-8 flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(comp)}
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{comp.title}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(comp.start_date), 'MMM d')} - {format(new Date(comp.end_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Users className="h-3.5 w-3.5" />
                        <span>{comp.registrations?.length || 0} registered</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                        <Globe className="h-3.5 w-3.5" />
                        <span>/{comp.slug}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#111]/50 border-l border-[#1a1a1a] p-6 flex flex-row md:flex-col items-center justify-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                       <span className="text-[9px] uppercase font-bold text-gray-500">Live</span>
                       <Switch 
                         checked={comp.is_public} 
                         onCheckedChange={(val: boolean) => handleStatusToggle(comp.id, val)}
                       />
                    </div>
                    <Button variant="outline" size="icon" className="bg-black border-[#222] hover:bg-white hover:text-black transition-all" asChild>
                       <Link href={`/competitions/${comp.id}`}>
                          <Settings2 className="h-4 w-4" />
                       </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
