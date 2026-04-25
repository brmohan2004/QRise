'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserPlanBadge } from './user-plan-badge'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Mail, Calendar, Hash, ShieldAlert } from 'lucide-react'

interface UserDetail {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan: string
  is_suspended: boolean
  suspended_reason?: string
  suspended_at?: string
  created_at: string
}

interface UserDetailCardProps {
  user: UserDetail
}

export function UserDetailCard({ user }: UserDetailCardProps) {
  return (
    <Card className="bg-[#111] border-[#222] text-white">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-16 w-16 border-2 border-[#222]">
          <AvatarImage src={user.avatar_url || ''} />
          <AvatarFallback className="bg-[#1a1a1a] text-xl">
            {user.email.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{user.full_name || 'No Name'}</h2>
            <UserPlanBadge plan={user.plan} />
          </div>
          <span className="text-gray-400 text-sm flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            {user.email}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Account Status</span>
            <div>
              {user.is_suspended ? (
                <Badge variant="outline" className="bg-red-900/10 text-red-500 border-red-900/20 gap-1.5">
                  <ShieldAlert className="h-3 w-3" />
                  Suspended
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-900/10 text-green-500 border-green-900/20">
                  Active
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Joined Date</span>
            <div className="flex items-center gap-1.5 text-sm text-gray-300">
              <Calendar className="h-3 w-3 text-gray-500" />
              {format(new Date(user.created_at), 'MMMM d, yyyy')}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">User ID</span>
            <div className="flex items-center gap-1.5 text-sm text-gray-300 font-mono">
              <Hash className="h-3 w-3 text-gray-500" />
              {user.id.substring(0, 8)}...
            </div>
          </div>
        </div>
        
        {user.is_suspended && user.suspended_reason && (
          <div className="p-3 bg-red-900/10 border border-red-900/20 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Suspension Reason</span>
            <p className="text-sm text-red-200 mt-1">{user.suspended_reason}</p>
            <p className="text-[10px] text-red-500/60 mt-1">
              Suspended on {user.suspended_at ? format(new Date(user.suspended_at), 'PPP') : 'Unknown date'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
