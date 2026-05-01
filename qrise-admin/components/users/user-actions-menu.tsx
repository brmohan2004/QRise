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
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface UserActionsMenuProps {
  userId: string
  isSuspended: boolean
}

export function UserActionsMenu({ userId, isSuspended }: UserActionsMenuProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [activeDialog, setActiveDialog] = useState<'suspend' | 'delete' | 'impersonate' | null>(null)
  const [suspensionReason, setSuspensionReason] = useState('')

  const handleImpersonate = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/impersonate`, { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        toast.success('Starting impersonation session...')
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to impersonate')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
      setActiveDialog(null)
    }
  }

  const handleToggleSuspension = async () => {
    setIsLoading(true)
    const action = isSuspended ? 'unsuspend' : 'suspend'
    try {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: isSuspended ? '' : (suspensionReason || 'Suspended by Admin') 
        })
      })
      if (!res.ok) throw new Error(`Failed to ${action} user`)
      
      toast.success(`User account ${isSuspended ? 'unsuspended' : 'suspended'} successfully`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
      setActiveDialog(null)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      })
      if (!res.ok) throw new Error('Failed to delete user')
      
      toast.success('User account deleted permanently')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
      setActiveDialog(null)
    }
  }

  return (
    <>
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
            onClick={() => setActiveDialog('impersonate')}
            disabled={isLoading}
          >
            <UserCog className="h-4 w-4" />
            Impersonate
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#222]" />
          <DropdownMenuItem 
            className="cursor-pointer focus:bg-[#1a1a1a] focus:text-white flex items-center gap-2"
            onClick={() => setActiveDialog('suspend')}
            disabled={isLoading}
          >
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
          <DropdownMenuItem 
            className="cursor-pointer focus:bg-red-900/20 focus:text-red-400 flex items-center gap-2 text-red-400"
            onClick={() => setActiveDialog('delete')}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog 
        isOpen={activeDialog === 'impersonate'}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleImpersonate}
        title="Start Impersonation?"
        description="You are about to log in as this user. Your administrative actions will be logged."
        confirmText="Start Session"
        variant="info"
        isLoading={isLoading}
      />

      <ConfirmDialog 
        isOpen={activeDialog === 'suspend'}
        onClose={() => {
          setActiveDialog(null)
          setSuspensionReason('')
        }}
        onConfirm={handleToggleSuspension}
        title={isSuspended ? "Lift Suspension?" : "Suspend Account?"}
        description={isSuspended 
          ? "This will restore user access and reactivate their QR codes."
          : "This will immediately block user access and disable all their active QR codes."
        }
        confirmText={isSuspended ? "Unsuspend" : "Confirm Suspension"}
        variant="warning"
        isLoading={isLoading}
      >
        {!isSuspended && (
          <div className="space-y-2 text-left">
            <Label htmlFor="reason" className="text-xs text-gray-400">Suspension Reason (Shown to user)</Label>
            <Input 
              id="reason"
              placeholder="e.g., Repeated violations of terms, suspicious activity..."
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="bg-[#111] border-[#222] text-white focus:ring-amber-500/20 h-11"
              autoFocus
            />
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog 
        isOpen={activeDialog === 'delete'}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleDelete}
        title="Permanently Delete Account?"
        description="This action is irreversible. All user data, QR codes, and forms will be removed."
        confirmText="Delete Now"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  )
}
