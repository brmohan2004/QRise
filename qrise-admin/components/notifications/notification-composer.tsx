'use client'

import { useState, useEffect, useCallback } from 'react'
import { NotificationTypeSelector } from './notification-type-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Send, Save, Loader2, Search, Users } from 'lucide-react'

export function NotificationComposer() {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [type, setType] = useState<'email' | 'push'>('email')
  const [targetType, setTargetType] = useState('all')
  const [targetId, setTargetId] = useState('')
  const [targetPlan, setTargetPlan] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [estimate, setEstimate] = useState<number | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)

  const fetchRecipientEstimate = useCallback(async () => {
    if (targetType === 'user' && !targetId) {
      setEstimate(0)
      return
    }
    
    setIsEstimating(true)
    try {
      const params = new URLSearchParams({ targetType })
      if (targetId) params.append('targetId', targetId)
      if (targetPlan) params.append('targetPlan', targetPlan)
      
      const res = await fetch(`/api/admin/notifications/count?${params}`)
      const data = await res.json()
      setEstimate(data.count)
    } catch (error) {
      console.error('Error fetching estimate:', error)
    } finally {
      setIsEstimating(false)
    }
  }, [targetType, targetId, targetPlan])

  // Recalculate estimate whenever target changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipientEstimate()
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [targetType, targetId, targetPlan, fetchRecipientEstimate])

  const handleSend = async (sendImmediately: boolean) => {
    if (type === 'email' && !subject) {
      toast.error('Subject is required for emails')
      return
    }
    if (!body) {
      toast.error('Notification body is required')
      return
    }

    setIsSending(true)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          subject,
          body,
          targetType,
          targetId: targetType === 'user' ? targetId : null,
          targetPlan: targetType === 'plan' ? targetPlan : null,
          sendImmediately
        }),
      })

      if (!res.ok) throw new Error('Failed to process notification')

      toast.success(sendImmediately ? 'Notification sent successfully' : 'Draft saved')
      router.push('/notifications')
      router.refresh()
    } catch {
      toast.error('Error processing notification')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-8">
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] space-y-6">
          <NotificationTypeSelector value={type} onChange={setType} />

          <div className="space-y-4 pt-4 border-t border-[#111]">
            <div className="space-y-2">
              <Label className="text-white">Recipients</Label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger className="bg-black border-[#222] text-white">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-[#222] text-white">
                  <SelectItem value="all">All Registered Users</SelectItem>
                  <SelectItem value="plan">All users on specific Plan</SelectItem>
                  <SelectItem value="user">Specific User (Search)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetType === 'plan' && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Select Plan</Label>
                <Select value={targetPlan} onValueChange={setTargetPlan}>
                  <SelectTrigger className="bg-black border-[#222] text-white">
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-[#222] text-white">
                    {['free', 'pro', 'business', 'enterprise'].map(p => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {targetType === 'user' && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">User ID or Email</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Enter user email or ID..." 
                    className="bg-black border-[#222] pl-10 text-white"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] space-y-6">
          <div className="space-y-2">
            <Label className="text-white">Content</Label>
            {type === 'email' && (
              <Input 
                placeholder="Message Subject" 
                className="bg-black border-[#222] text-white mb-4"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            )}
            <Textarea 
              placeholder={type === 'email' ? "Message body (Markdown supported)" : "Push notification message (Keep it short)"}
              className="bg-black border-[#222] text-white min-h-[200px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={() => handleSend(true)} 
            disabled={isSending}
            className="flex-1 bg-white text-black hover:bg-gray-200 font-bold py-6 rounded-xl"
          >
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Notification
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSend(false)}
            disabled={isSending}
            className="bg-transparent border-[#222] text-gray-400 hover:text-white py-6 px-6 rounded-xl"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-[#1a1a1a] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            Audience Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Target Segment</span>
              <span className="text-white capitalize font-medium">{targetType} {targetPlan ? `(${targetPlan})` : ''}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Estimated Recipients</span>
              {isEstimating ? (
                <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
              ) : (
                <span className="text-white font-bold">{estimate !== null ? estimate.toLocaleString() : '---'}</span>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-[#111]">
             <Button 
               variant="ghost" 
               size="sm" 
               className="w-full text-xs text-gray-500 hover:text-white"
               onClick={fetchRecipientEstimate}
               disabled={isEstimating}
             >
                {isEstimating ? 'Calculating...' : 'Recalculate Estimate'}
             </Button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-[#1a1a1a] opacity-50 pointer-events-none">
          <p className="text-[10px] uppercase text-gray-500 font-black mb-3 tracking-tighter">Mobile Preview</p>
          <div className="aspect-[9/16] bg-black border border-[#222] rounded-3xl p-4 flex flex-col items-center">
             <div className="w-12 h-1 bg-[#222] rounded-full mb-8" />
             <div className="w-full p-3 bg-[#111] rounded-xl border border-[#222] space-y-1">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-4 h-4 bg-white rounded-sm" />
                   <span className="text-[8px] text-gray-400 font-bold uppercase">QRise</span>
                </div>
                <p className="text-[10px] font-bold text-white truncate">{subject || 'New Notification'}</p>
                <p className="text-[9px] text-gray-500 line-clamp-2">{body || 'Message content preview...'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
