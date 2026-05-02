'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'

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
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050505] text-white p-6">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 border border-red-900/30">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2 uppercase">Application Error</h1>
        <p className="text-gray-400 font-medium mb-8">
          A critical error occurred in the Admin Panel. Our engineering team has been notified.
        </p>
        <div className="flex items-center gap-4 w-full">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1 bg-transparent border-[#222] text-white hover:bg-[#111] h-12 rounded-xl font-bold"
          >
            Reload Page
          </Button>
          <Button 
            onClick={() => reset()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-red-900/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
        {error.digest && (
          <p className="mt-8 text-[10px] font-mono text-gray-700 uppercase tracking-widest">
            Digest: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
