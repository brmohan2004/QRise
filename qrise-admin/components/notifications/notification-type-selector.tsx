'use client'

import { Mail, Bell } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface NotificationTypeSelectorProps {
  value: 'email' | 'push'
  onChange: (value: 'email' | 'push') => void
}

export function NotificationTypeSelector({ value, onChange }: NotificationTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-gray-400 text-xs uppercase font-bold tracking-widest">Notification Channel</Label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('email')}
          className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
            value === 'email' 
              ? 'bg-white/10 border-white text-white' 
              : 'bg-black border-[#222] text-gray-500 hover:border-[#333]'
          }`}
        >
          <Mail className={`h-6 w-6 ${value === 'email' ? 'text-white' : 'text-gray-500'}`} />
          <span className="text-sm font-bold">Email Message</span>
        </button>
        
        <button
          type="button"
          onClick={() => onChange('push')}
          className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
            value === 'push' 
              ? 'bg-white/10 border-white text-white' 
              : 'bg-black border-[#222] text-gray-500 hover:border-[#333]'
          }`}
        >
          <Bell className={`h-6 w-6 ${value === 'push' ? 'text-white' : 'text-gray-500'}`} />
          <span className="text-sm font-bold">Push Notification</span>
        </button>
      </div>
    </div>
  )
}
