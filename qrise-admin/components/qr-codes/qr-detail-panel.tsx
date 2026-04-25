'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ExternalLink, User, Calendar, MousePointer2, Settings2, ShieldCheck, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

interface QRDetailPanelProps {
  qrCode: {
    id: string
    name: string
    is_active: boolean
    target_url: string
    short_code: string
    type: string
    user_id: string
    users?: { full_name?: string; email?: string }
    scan_count: number
    created_at: string
    design_settings?: { dots?: { type?: string; color?: string }; corners?: { type?: string; color?: string }; cornersDot?: { type?: string; color?: string }; logo_url?: string; is_custom?: boolean; background?: string } | null
  }
}

export function QRDetailPanel({ qrCode }: QRDetailPanelProps) {
  return (
    <Card className="bg-[#111] border-[#222] text-white">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#222]">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">QR</span>
          </div>
          <div>
            <CardTitle className="text-xl font-bold">{qrCode.name}</CardTitle>
            <p className="text-gray-500 text-xs font-mono">{qrCode.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {qrCode.is_active ? (
            <Badge variant="outline" className="bg-green-900/10 text-green-500 border-green-900/20 gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-900/10 text-red-500 border-red-900/20 gap-1.5">
              <ShieldAlert className="h-3 w-3" />
              Suspended
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Destination URL</span>
            <div className="flex items-center gap-2">
              <Link 
                href={qrCode.target_url} 
                target="_blank" 
                className="text-sm text-blue-400 hover:underline flex items-center gap-1.5 truncate"
              >
                {qrCode.target_url}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Short Code</span>
              <div className="text-sm font-mono text-gray-300">{qrCode.short_code}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">QR Type</span>
              <div>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400 uppercase text-[10px]">
                  {qrCode.type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Owner Info</span>
            <Link 
              href={`/users/${qrCode.user_id}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{qrCode.users?.full_name || 'Owner'}</span>
                <span className="text-[10px] text-gray-500">{qrCode.users?.email}</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <MousePointer2 className="h-4 w-4 mx-auto mb-2 text-gray-500" />
              <div className="text-2xl font-bold">{qrCode.scan_count.toLocaleString()}</div>
              <span className="text-[10px] uppercase text-gray-500 font-bold">Total Scans</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <Calendar className="h-4 w-4 mx-auto mb-2 text-gray-500" />
              <div className="text-sm font-medium">{format(new Date(qrCode.created_at), 'MMM d, yyyy')}</div>
              <span className="text-[10px] uppercase text-gray-500 font-bold">Created On</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#222] bg-[#0d0d0d] space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
              <Settings2 className="h-4 w-4" />
              Design Configuration
            </div>
            <div className="grid grid-cols-2 gap-y-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">Dot Pattern</span>
                <span className="text-xs">{qrCode.design_settings?.dots?.type || 'Default'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">Eye Shape</span>
                <span className="text-xs">{qrCode.design_settings?.cornersDot?.type || 'Default'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">Primary Color</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full border border-white/10" style={{ backgroundColor: qrCode.design_settings?.dots?.color || '#000' }} />
                  <span className="text-xs font-mono">{qrCode.design_settings?.dots?.color || '#000000'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
