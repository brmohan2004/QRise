'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Edit2, Trash2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { format } from 'date-fns'

interface Coupon {
  id: string
  code: string
  description: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  is_active: boolean
  max_uses: number | null
  uses_count: number
  valid_until: string | null
}

interface CouponsTableProps {
  data: Coupon[]
  onStatusToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
}

export function CouponsTable({ data, onStatusToggle, onDelete }: CouponsTableProps) {
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Code ${code} copied!`)
  }

  const getStatus = (coupon: Coupon) => {
    if (!coupon.is_active) return { label: 'Inactive', color: 'bg-gray-500/10 text-gray-500' }
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) return { label: 'Expired', color: 'bg-red-500/10 text-red-500' }
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) return { label: 'Maxed', color: 'bg-amber-500/10 text-amber-500' }
    return { label: 'Active', color: 'bg-green-500/10 text-green-500' }
  }

  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] overflow-hidden">
      <Table>
        <TableHeader className="bg-[#111]">
          <TableRow className="border-[#1a1a1a] hover:bg-transparent">
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Code</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Discount</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Usage</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Valid Until</TableHead>
            <TableHead className="text-gray-400 font-bold uppercase text-[10px]">Status</TableHead>
            <TableHead className="text-right text-gray-400 font-bold uppercase text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-20 text-gray-500 italic">
                No coupons found. Create your first campaign!
              </TableCell>
            </TableRow>
          ) : (
            data.map((coupon) => {
              const status = getStatus(coupon)
              const progress = coupon.max_uses ? (coupon.uses_count / coupon.max_uses) * 100 : 0

              return (
                <TableRow key={coupon.id} className="border-[#111] hover:bg-white/[0.02]">
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-black text-white bg-[#111] px-1.5 py-0.5 rounded text-xs">{coupon.code}</code>
                        <button onClick={() => copyToClipboard(coupon.code)} className="text-gray-600 hover:text-white">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 max-w-[150px] truncate">{coupon.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-white">
                      {coupon.discount_type === 'percent' ? `${coupon.discount_value}% Off` : `$${coupon.discount_value} Off`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-[120px] space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>{coupon.uses_count} used</span>
                        <span>{coupon.max_uses || '∞'} max</span>
                      </div>
                      {coupon.max_uses && <Progress value={progress} className="h-1 bg-[#111] [&>div]:bg-blue-500" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] text-gray-400">
                    {coupon.valid_until ? format(new Date(coupon.valid_until), 'MMM d, yyyy') : 'No Expiry'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Badge className={`text-[9px] uppercase px-2 py-0 ${status.color}`}>
                        {status.label}
                      </Badge>
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={(val: boolean) => onStatusToggle(coupon.id, val)}
                        className="scale-75"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white" asChild>
                        <Link href={`/coupons/${coupon.id}`}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                        onClick={() => onDelete(coupon.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
