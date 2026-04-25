'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { MousePointer2, Smartphone, Globe } from 'lucide-react'

interface ScanEvent {
  id: string
  qr_name: string
  created_at: string
  country?: string
  device?: string
}

interface UserActivityLogProps {
  scans: ScanEvent[]
}

export function UserActivityLog({ scans }: UserActivityLogProps) {
  return (
    <Card className="bg-[#111] border-[#222] text-white h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Scan Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scans.length > 0 ? (
            scans.map((scan) => (
              <div key={scan.id} className="flex items-start gap-3 p-3 bg-[#0a0a0a] border border-[#222] rounded-lg">
                <div className="mt-1 bg-white/5 p-1.5 rounded-md">
                  <MousePointer2 className="h-3 w-3 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">Scanned &quot;{scan.qr_name}&quot;</p>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                      {format(new Date(scan.created_at), 'HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Globe className="h-2.5 w-2.5" />
                      {scan.country || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Smartphone className="h-2.5 w-2.5" />
                      {scan.device || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No recent scan activity.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
