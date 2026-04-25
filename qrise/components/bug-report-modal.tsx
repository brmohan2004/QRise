'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Bug } from 'lucide-react'

interface BugReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState('')
  const [severity, setSeverity] = useState('medium')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description) return

    setIsSubmitting(true)
    try {
      const browserInfo = {
        userAgent: navigator.userAgent,
        os: navigator.platform,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        vendor: navigator.vendor
      }

      const res = await fetch('/api/reports/bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.href,
          description,
          steps_to_reproduce: steps,
          severity,
          browser_info: browserInfo
        }),
      })

      if (!res.ok) throw new Error('Failed to submit')

      toast.success('Bug report submitted! Thank you.')
      setDescription('')
      setSteps('')
      setSeverity('medium')
      onClose()
    } catch (error) {
      toast.error('Error submitting report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-black border-[#222] text-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Bug className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Report a Bug</DialogTitle>
              <DialogDescription className="text-gray-400">
                Found something broken? Let us know so we can fix it.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="bg-black border-[#333]">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#333] text-white">
                <SelectItem value="low">Low - Minor UI issue</SelectItem>
                <SelectItem value="medium">Medium - Something isn't right</SelectItem>
                <SelectItem value="high">High - Functional break</SelectItem>
                <SelectItem value="critical">Critical - System crash / Data loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">What happened?</Label>
            <Textarea
              id="description"
              placeholder="Describe the bug in detail..."
              className="min-h-[100px] bg-black border-[#333]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Steps to reproduce (optional)</Label>
            <Textarea
              id="steps"
              placeholder="1. Click on... 2. Select... 3. See error..."
              className="min-h-[80px] bg-black border-[#333]"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8"
              disabled={isSubmitting || !description}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
