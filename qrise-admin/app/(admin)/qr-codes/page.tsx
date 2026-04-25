'use client'

import { QRCodesTable } from '@/components/qr-codes/qr-codes-table'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'

export default function QRCodesPage() {
  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['admin', 'qr_codes'],
    queryFn: async () => {
      const res = await fetch('/api/admin/qr-codes')
      return res.json()
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">QR Code Management</h1>
        <p className="text-gray-400">Browse and manage all QR codes generated across the platform.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-[#111]" />
          <Skeleton className="h-[500px] w-full bg-[#111]" />
        </div>
      ) : (
        <QRCodesTable data={qrCodes || []} />
      )}
    </div>
  )
}
