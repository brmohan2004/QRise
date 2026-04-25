'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface QRCode {
  id: string
  name: string
  type: string
  scan_count: number
  created_at: string
}

interface UserQRListProps {
  qrCodes: QRCode[]
}

export function UserQRList({ qrCodes }: UserQRListProps) {
  return (
    <Card className="bg-[#111] border-[#222] text-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          User&apos;s QR Codes
          <Badge variant="outline" className="border-[#333] text-gray-500">{qrCodes.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-[#222]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400 text-right">Scans</TableHead>
                <TableHead className="text-gray-400 text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.length > 0 ? (
                qrCodes.map((qr) => (
                  <TableRow key={qr.id} className="border-[#222] hover:bg-[#1a1a1a]">
                    <TableCell className="font-medium">{qr.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase border-[#333] text-gray-400">
                        {qr.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-gray-300">{qr.scan_count.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-xs text-gray-500">
                      {format(new Date(qr.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                    No QR codes found for this user.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
