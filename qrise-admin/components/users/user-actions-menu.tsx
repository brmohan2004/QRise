'use client'

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Ban, UserCheck, Trash2, UserCog } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface UserActionsMenuProps {
  userId: string
  isSuspended: boolean
}

export function UserActionsMenu({ userId, isSuspended }: UserActionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleImpersonate = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/impersonate`, { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#1a1a1a] text-gray-400">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#111] border-[#222] text-white w-[160px]">
        <DropdownMenuLabel className="text-gray-500 text-[10px] uppercase font-bold">Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
          <Link href={`/users/${userId}`} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer focus:bg-[#1a1a1a] focus:text-white flex items-center gap-2"
          onClick={handleImpersonate}
          disabled={isLoading}
        >
          <UserCog className="h-4 w-4" />
          Impersonate
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#222]" />
        <DropdownMenuItem className="cursor-pointer focus:bg-[#1a1a1a] focus:text-white flex items-center gap-2">
          {isSuspended ? (
            <>
              <UserCheck className="h-4 w-4 text-green-500" />
              Unsuspend
            </>
          ) : (
            <>
              <Ban className="h-4 w-4 text-amber-500" />
              Suspend User
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer focus:bg-red-900/20 focus:text-red-400 flex items-center gap-2 text-red-400">
          <Trash2 className="h-4 w-4" />
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
