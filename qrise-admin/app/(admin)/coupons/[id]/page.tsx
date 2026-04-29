'use client'

import { CouponForm } from '@/components/coupons/coupon-form'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditCouponPage() {
  const { id } = useParams()
  
  const { data: coupon, isLoading, error } = useQuery({
    queryKey: ['admin', 'coupons', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/coupons/${id}`)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch coupon')
      }
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
           <Skeleton className="h-4 w-24 bg-[#111]" />
           <Skeleton className="h-10 w-64 bg-[#111]" />
        </div>
        <Skeleton className="h-[600px] w-full bg-[#111] rounded-2xl" />
      </div>
    )
  }

  if (error || !coupon) {
    return (
      <div className="space-y-8 text-center py-20">
        <div className="bg-red-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">Coupon Not Found</h1>
        <p className="text-gray-400">The coupon you are looking for does not exist or has been deleted.</p>
        <Button asChild className="mt-8 bg-white text-black hover:bg-gray-200">
          <Link href="/coupons">Back to Coupons</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link 
          href="/coupons" 
          className="text-gray-500 hover:text-white flex items-center text-sm mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Coupons
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Coupon</h1>
        <p className="text-gray-400">Update campaign details for <span className="text-white font-mono">{coupon.code}</span></p>
      </div>

      <CouponForm initialData={coupon} id={id as string} />
    </div>
  )
}
