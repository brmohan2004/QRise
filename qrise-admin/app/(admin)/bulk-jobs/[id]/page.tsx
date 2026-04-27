'use client'

import { QRCodesTable } from '@/components/qr-codes/qr-codes-table'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Layers } from 'lucide-react'

export default function BulkJobDetailsPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['admin', 'bulk_jobs', id, 'qr_codes'],
    queryFn: async () => {
      const res = await fetch(`/api/admin/bulk-jobs/${id}/qr-codes`)
      return res.json()
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white hover:bg-[#111]"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-500" />
            <h1 className="text-3xl font-bold tracking-tight text-white">Bulk Batch Details</h1>
          </div>
          <p className="text-gray-400">Batch ID: <span className="font-mono text-xs">{id}</span></p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-[#111]" />
          <Skeleton className="h-[500px] w-full bg-[#111]" />
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-[#1a1a1a]">
            <h2 className="text-xl font-semibold text-white">QR Codes in this Batch</h2>
            <p className="text-sm text-gray-500">Total: {qrCodes?.length || 0} QR codes</p>
          </div>
          <QRCodesTable data={qrCodes || []} />
        </div>
      )}
    </div>
  )
}
