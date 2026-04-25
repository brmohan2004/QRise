'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CouponsTable } from '@/components/coupons/coupons-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Ticket, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CouponsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const res = await fetch('/api/admin/coupons')
      return res.json()
    }
  })

  const handleStatusToggle = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: active }),
      })
      if (!res.ok) throw new Error('Failed to update')
      
      toast.success(active ? 'Coupon activated' : 'Coupon deactivated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
    } catch {
      toast.error('Error updating coupon')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success('Coupon deleted')
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
    } catch {
      toast.error('Error deleting coupon')
    }
  }

  const filteredCoupons = coupons?.filter((c: { code: string; description?: string }) => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Coupon Management</h1>
          <p className="text-gray-400">Create and monitor discount codes for platform subscriptions.</p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-gray-200 font-bold">
          <Link href="/coupons/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search by code or description..." 
            className="bg-[#0a0a0a] border-[#1a1a1a] pl-10 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-transparent border-[#1a1a1a] text-gray-400">
           <Filter className="h-4 w-4 mr-2" />
           Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-[#111]" />
          <Skeleton className="h-[400px] w-full bg-[#111] rounded-2xl" />
        </div>
      ) : coupons?.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-[#1a1a1a] rounded-3xl bg-[#050505]">
          <div className="bg-[#111] w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
            <Ticket className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-gray-300 font-bold text-xl">No campaigns yet</p>
          <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">Boost your conversions by creating limited-time discount codes.</p>
          <Button asChild className="mt-8 bg-white text-black hover:bg-gray-200 font-bold px-8">
            <Link href="/coupons/new">Launch First Campaign</Link>
          </Button>
        </div>
      ) : (
        <CouponsTable 
          data={filteredCoupons || []} 
          onStatusToggle={handleStatusToggle}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
