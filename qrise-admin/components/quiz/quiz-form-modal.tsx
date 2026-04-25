'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Sparkles, Image as ImageIcon, Gift } from 'lucide-react'

interface QuizFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function QuizFormModal({ isOpen, onClose, onSuccess }: QuizFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    feature_name: '',
    hint_text: '',
    answer: '',
    gift_code: '',
    image_url: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/features-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create')

      toast.success('Quiz feature created!')
      setFormData({
        feature_name: '',
        hint_text: '',
        answer: '',
        gift_code: '',
        image_url: ''
      })
      onSuccess()
      onClose()
    } catch {
      toast.error('Error creating quiz feature')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-[#222] text-white">
        <DialogHeader>
           <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                 <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                 <DialogTitle className="text-xl font-bold">Add Quiz Feature</DialogTitle>
                 <DialogDescription className="text-gray-500">Create a &quot;Guess the feature&quot; challenge for users.</DialogDescription>
              </div>
           </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feature_name">Feature Name (Public when revealed)</Label>
            <Input 
              id="feature_name" 
              placeholder="e.g. Smart Routing 2.0" 
              className="bg-black border-[#333]" 
              value={formData.feature_name}
              onChange={e => setFormData({...formData, feature_name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hint_text">Hint Text (Shown to users)</Label>
            <Textarea 
              id="hint_text" 
              placeholder="It routes by location and device..." 
              className="bg-black border-[#333] min-h-[80px]" 
              value={formData.hint_text}
              onChange={e => setFormData({...formData, hint_text: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="answer">Correct Answer (Hashed)</Label>
              <Input 
                id="answer" 
                placeholder="smart routing" 
                className="bg-black border-[#333]" 
                value={formData.answer}
                onChange={e => setFormData({...formData, answer: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gift_code">Gift Code (Reward)</Label>
              <div className="relative">
                 <Gift className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                 <Input 
                   id="gift_code" 
                   placeholder="FREEPRO30" 
                   className="bg-black border-[#333] pl-10" 
                   value={formData.gift_code}
                   onChange={e => setFormData({...formData, gift_code: e.target.value})}
                 />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Blurred Preview Image URL</Label>
            <div className="relative">
               <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
               <Input 
                 id="image_url" 
                 placeholder="https://cloudinary.com/..." 
                 className="bg-black border-[#333] pl-10" 
                 value={formData.image_url}
                 onChange={e => setFormData({...formData, image_url: e.target.value})}
               />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" className="bg-white text-black hover:bg-gray-200 font-bold" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Launch Quiz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
