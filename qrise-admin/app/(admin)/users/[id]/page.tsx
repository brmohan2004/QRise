'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { UserDetailCard } from '@/components/users/user-detail-card'
import { UserQRList } from '@/components/users/user-qr-list'
import { UserActivityLog } from '@/components/users/user-activity-log'
import { UserActionsPanel } from '@/components/users/user-actions-panel'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function UserDetailPage() {
  const { id } = useParams()


  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${id}`)
      if (!res.ok) throw new Error('User not found')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-32 bg-[#111]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-48 w-full bg-[#111]" />
            <Skeleton className="h-96 w-full bg-[#111]" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-64 w-full bg-[#111]" />
            <Skeleton className="h-64 w-full bg-[#111]" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-white">User not found</h2>
        <Button asChild variant="outline">
          <Link href="/users">Back to Users</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Link href="/users">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Users
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & QRs */}
        <div className="lg:col-span-2 space-y-8">
          <UserDetailCard user={data.user} />
          <UserQRList qrCodes={data.qrCodes} />
        </div>

        {/* Right Column: Actions & Log */}
        <div className="space-y-8">
          <UserActionsPanel 
            userId={data.user.id} 
            isSuspended={data.user.is_suspended} 
            currentPlanName={data.user.plan}
          />
          <UserActivityLog scans={data.scans} />
        </div>
      </div>
    </div>
  )
}
