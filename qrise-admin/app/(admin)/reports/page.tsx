'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportsTable } from '@/components/reports/reports-table'
import { 
  AlertTriangle, 
  Bug, 

  Search, 
  RefreshCcw 
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReportsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'abuse' | 'bug'>('abuse')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'reports', activeTab, statusFilter, debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports?type=${activeTab}&status=${statusFilter}&q=${debouncedSearch}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch reports')
      }
      return res.json()
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reports Center</h1>
          <p className="text-gray-400">Review platform abuse and community bug reports.</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-[#0a0a0a] border-[#222] hover:border-blue-500/50 hover:bg-[#111] transition-all duration-300 shadow-lg group"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh reports"
        >
          <RefreshCcw className={`h-4 w-4 text-gray-400 group-hover:text-blue-400 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Tabs defaultValue="abuse" onValueChange={(val) => setActiveTab(val as 'abuse' | 'bug')} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-[#0a0a0a] border border-[#1a1a1a] p-1 rounded-2xl">
            <TabsTrigger value="abuse" className="rounded-xl data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Abuse Reports
            </TabsTrigger>
            <TabsTrigger value="bug" className="rounded-xl data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
              <Bug className="h-4 w-4 mr-2" />
              Bug Reports
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
             <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search reports..." 
                  className="bg-[#0a0a0a] border-[#1a1a1a] pl-10 text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <select 
               className="bg-[#0a0a0a] border border-[#1a1a1a] text-sm text-white rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="actioned">Actioned</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
                <option value="all">All Status</option>
             </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
             <Skeleton className="h-10 w-full bg-[#111] rounded-xl" />
             <Skeleton className="h-64 w-full bg-[#111] rounded-3xl" />
          </div>
        ) : (
          <>
            <TabsContent value="abuse" className="mt-0">
               <ReportsTable 
                 type="abuse" 
                 data={data?.data || []} 
                 onUpdate={() => queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })} 
               />
            </TabsContent>
            <TabsContent value="bug" className="mt-0">
               <ReportsTable 
                 type="bug" 
                 data={data?.data || []} 
                 onUpdate={() => queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })} 
               />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
