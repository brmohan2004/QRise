'use client'

import { useState } from 'react'
import { Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BugReportModal } from './bug-report-modal'

export function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-500 text-white z-50 p-0"
        title="Report a Bug"
      >
        <Bug className="h-6 w-6" />
      </Button>

      <BugReportModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
