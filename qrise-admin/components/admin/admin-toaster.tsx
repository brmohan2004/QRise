'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function AdminToaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      expand={true}
      richColors={true}
      icons={{
        success: (
          <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        ),
        error: (
          <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
        )
      }}
      toastOptions={{
        style: {
          background: '#0a0a0a',
          border: '1px solid #222',
          color: '#fff',
          fontFamily: 'var(--font-geist-sans)',
          zIndex: 9999,
        },
        className: 'admin-toast',
      }}
    />
  )
}
