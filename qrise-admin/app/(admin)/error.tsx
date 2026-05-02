'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-[2.5rem] border border-[#1a1a1a] bg-[#0a0a0a] p-12 text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-red-900/10 rounded-3xl flex items-center justify-center mb-6 border border-red-900/20">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Section Failed to Load</h2>
      <p className="text-gray-400 max-w-sm font-medium mb-8">
        We encountered a problem while loading this section of the admin panel. 
      </p>
      <Button 
        onClick={() => reset()}
        className="bg-white text-black hover:bg-gray-200 h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95"
      >
        <RefreshCw className="w-3.5 h-3.5 mr-2" />
        Retry Section
      </Button>
    </div>
  )
}
