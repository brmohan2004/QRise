'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export function TopQRsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'top_qrs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?view=top_qrs')
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <Card className="bg-[#111] border-[#222]">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-[#222]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full bg-[#222]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#111] border-[#222] text-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Performing QR Codes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Owner</TableHead>
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400 text-right">Scans</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((qr: { id: string, name: string, owner: string, type: string, scans: number }) => (
              <TableRow key={qr.id} className="border-[#222] hover:bg-[#1a1a1a]">
                <TableCell className="font-medium">{qr.name}</TableCell>
                <TableCell className="text-gray-400">{qr.owner}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase border-[#333] text-gray-400">
                    {qr.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold">{qr.scans.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
