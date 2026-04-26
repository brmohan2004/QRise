'use client'

import { AlertTriangle, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function ImpersonateBanner() {
  const router = useRouter()
  const supabase = createClient()
  const [impersonatedEmail, setImpersonatedEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkImpersonation = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.impersonating || window.location.search.includes('impersonated=true')) {
        setImpersonatedEmail(user?.email || 'User')
      }
    }
    checkImpersonation()
  }, [supabase.auth])

  const handleExit = async () => {
    // Standard logout or special exit impersonation endpoint if implemented
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!impersonatedEmail) return null

  return (
    <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-3 z-[100] relative">
      <AlertTriangle className="h-4 w-4" />
      <span>VIEWING AS: <span className="underline">{impersonatedEmail}</span></span>
      <button 
        onClick={handleExit}
        className="ml-4 bg-white text-red-600 px-3 py-1 rounded-full text-xs font-black hover:bg-gray-100 transition-colors flex items-center gap-1"
      >
        <LogOut className="h-3 w-3" />
        Exit Impersonation
      </button>
    </div>
  )
}
