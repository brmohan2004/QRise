'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Server, Zap, Mail, Globe, LucideIcon } from 'lucide-react'

interface HealthCardProps {
  services: {
    supabase: string
    redis: string
    resend: string
    worker: string
  }
}

interface ServiceRowProps {
  name: string
  status: string
  icon: LucideIcon
}

function ServiceRow({ name, status, icon: Icon }: ServiceRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-[#111]">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[#111] flex items-center justify-center">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
        <span className="text-sm font-bold text-gray-300">{name}</span>
      </div>
      <div className="flex items-center gap-2">
         <span className="text-[10px] uppercase font-black text-gray-500 tracking-widest">{status}</span>
         <div className={`h-2 w-2 rounded-full ${status === 'up' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
      </div>
    </div>
  )
}

export function HealthCard({ services }: HealthCardProps) {
  return (
    <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ServiceRow name="Supabase DB" status={services.supabase} icon={Server} />
          <ServiceRow name="Upstash Redis" status={services.redis} icon={Zap} />
          <ServiceRow name="Resend Email" status={services.resend} icon={Mail} />
          <ServiceRow name="CF Workers" status={services.worker} icon={Globe} />
        </div>
      </CardContent>
    </Card>
  )
}
