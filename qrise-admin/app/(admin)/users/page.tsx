'use client'

import { UsersTable } from '@/components/users/users-table'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function UsersPage() {
  const { data: users, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      return res.json()
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
          <p className="text-gray-400">Manage all registered users, their plans, and account status.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isFetching}
          className="bg-transparent border-[#222] text-gray-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-[#111]" />
          <Skeleton className="h-[400px] w-full bg-[#111]" />
        </div>
      ) : (
        <UsersTable data={users || []} />
      )}
    </div>
  )
}
