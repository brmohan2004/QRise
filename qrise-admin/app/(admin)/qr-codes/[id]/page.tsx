'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { QRDetailPanel } from '@/components/qr-codes/qr-detail-panel'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, Smartphone, Globe, MousePointer2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function QRDetailPage() {
  const { id } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'qr_codes', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/qr-codes/${id}`)
      if (!res.ok) throw new Error('QR code not found')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-32 bg-[#111]" />
        <Skeleton className="h-96 w-full bg-[#111]" />
        <Skeleton className="h-64 w-full bg-[#111]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-white">QR Code not found</h2>
        <Button asChild variant="outline">
          <Link href="/qr-codes">Back to QR Codes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Link href="/qr-codes">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to QR Codes
          </Link>
        </Button>
      </div>

      <QRDetailPanel qrCode={data.qrCode} />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Scans (Last 50)</h3>
        <div className="rounded-md border border-[#222] bg-[#0a0a0a]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableHead className="text-gray-400">Timestamp</TableHead>
                <TableHead className="text-gray-400">Location</TableHead>
                <TableHead className="text-gray-400">Device / OS</TableHead>
                <TableHead className="text-gray-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.scans.length > 0 ? (
                data.scans.map((scan: { id: string; created_at: string; city?: string; country?: string; device?: string; os?: string }) => (
                  <TableRow key={scan.id} className="border-[#222] hover:bg-[#111]">
                    <TableCell className="text-sm text-gray-300">
                      {format(new Date(scan.created_at), 'PPP pp')}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Globe className="h-3 w-3" />
                        {scan.city ? `${scan.city}, ` : ''}{scan.country || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Smartphone className="h-3 w-3" />
                        {scan.device || 'Unknown'} / {scan.os || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-[10px] text-gray-500 font-mono">
                        <MousePointer2 className="h-2 w-2" />
                        SCAN_RECORDED
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                    No scans recorded for this QR code yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
