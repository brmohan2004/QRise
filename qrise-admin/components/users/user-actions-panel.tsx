'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ban, UserCheck, Trash2, UserCog, Settings } from 'lucide-react'
import { useState } from 'react'

interface UserActionsPanelProps {
  userId: string
  isSuspended: boolean
}

export function UserActionsPanel({ userId, isSuspended }: UserActionsPanelProps) {
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
    <Card className="bg-[#111] border-[#222] text-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Administrative Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 bg-transparent border-[#222] hover:bg-[#1a1a1a]"
          onClick={handleImpersonate}
          disabled={isLoading}
        >
          <UserCog className="h-4 w-4" />
          Impersonate User
        </Button>
        
        <Button variant="outline" className="w-full justify-start gap-2 bg-transparent border-[#222] hover:bg-[#1a1a1a]">
          <Settings className="h-4 w-4" />
          Modify Subscription Plan
        </Button>

        <div className="pt-2 border-t border-[#222] space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 bg-transparent border-[#222] hover:bg-amber-900/10 hover:text-amber-500 hover:border-amber-900/20"
          >
            {isSuspended ? (
              <>
                <UserCheck className="h-4 w-4" />
                Lift Suspension
              </>
            ) : (
              <>
                <Ban className="h-4 w-4" />
                Suspend Account
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 bg-transparent border-red-900/20 text-red-500 hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            Permanently Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
