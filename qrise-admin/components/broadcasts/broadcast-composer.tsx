'use client'

import { useState } from 'react'
import { SegmentSelector } from './segment-selector'
import { BroadcastPreview } from './broadcast-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Send, Save, AlertCircle, Loader2 } from 'lucide-react'

export function BroadcastComposer() {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [segment, setSegment] = useState<Record<string, unknown>>({ type: 'all' })

  const handleSend = async () => {
    if (!subject || !body) {
      toast.error('Subject and body are required')
      return
    }

    setIsSending(true)
    try {
      const res = await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, segment }),
      })

      if (!res.ok) throw new Error('Failed to send broadcast')

      toast.success('Broadcast is being sent!')
      router.push('/broadcasts')
      router.refresh()
    } catch {
      toast.error('Error sending broadcast')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-4 bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a]">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-white">Email Subject</Label>
            <Input 
              id="subject" 
              placeholder="The big announcement..." 
              className="bg-black border-[#222] text-white"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body" className="text-white">Email Body (HTML supported)</Label>
            <Textarea 
              id="body" 
              placeholder="<h1>Hello!</h1><p>We have some news...</p>" 
              className="bg-black border-[#222] text-white min-h-[300px] font-mono text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSend} 
            disabled={isSending}
            className="flex-1 bg-white text-black hover:bg-gray-200 font-bold py-6 rounded-xl"
          >
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Broadcast Now
          </Button>
          <Button 
            variant="outline" 
            className="bg-transparent border-[#222] text-gray-400 hover:text-white py-6 px-6 rounded-xl"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-200/80 leading-relaxed">
            <strong>Careful:</strong> Broadcasts are sent to all users in the selected segment. This action cannot be undone. Ensure your HTML is valid and the subject is correct.
          </p>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <SegmentSelector onChange={setSegment} />
        <BroadcastPreview subject={subject} body={body} />
      </div>
    </div>
  )
}
