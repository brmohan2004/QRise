'use client'

import { format } from 'date-fns'
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle2, 
  XCircle,
  ShieldAlert,
  Trash2,
  Loader2,
  MessageSquare
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { ReportDetailsModal } from './report-details-modal'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { toast } from 'sonner'

interface ReportData {
  id: string
  qr_codes?: { name: string; short_code: string }
  reason?: string
  users?: { email: string }
  description?: string
  url?: string
  severity?: string
  created_at: string
  status: string
  // Feedback specific
  type?: string
  subject?: string
  content?: string
  user_email?: string
}

interface ReportsTableProps {
  type: 'abuse' | 'feedback'
  data: ReportData[]
  onUpdate: () => void
}

export function ReportsTable({ type, data, onUpdate }: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)

  const handleViewDetails = (report: ReportData) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const endpoint = type === 'abuse' ? `/api/admin/reports/${id}` : `/api/admin/feedback`
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update status')
      }

      toast.success(`Report ${status}`)
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Error updating status')
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const endpoint = type === 'abuse' ? `/api/admin/reports/${id}` : `/api/admin/feedback?id=${id}`
      const res = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete report')
      }

      toast.success('Report deleted successfully')
      setIsDeleteDialogOpen(false)
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Error deleting report')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[10px]">Pending</Badge>
      case 'reviewed': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase text-[10px]">Reviewed</Badge>
      case 'resolved':
      case 'actioned': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 uppercase text-[10px]">Actioned</Badge>
      case 'dismissed': return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20 uppercase text-[10px]">Dismissed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden">
      <Table>
        <TableHeader className="bg-[#111]/50">
          <TableRow className="border-[#1a1a1a] hover:bg-transparent">
            <TableHead className="text-gray-400 font-bold">{type === 'abuse' ? 'QR Code' : 'Type'}</TableHead>
            <TableHead className="text-gray-400 font-bold">{type === 'abuse' ? 'Reason' : 'Subject'}</TableHead>
            <TableHead className="text-gray-400 font-bold">{type === 'abuse' ? 'Reporter' : 'User'}</TableHead>
            <TableHead className="text-gray-400 font-bold">Date</TableHead>
            <TableHead className="text-gray-400 font-bold">Status</TableHead>
            <TableHead className="text-right text-gray-400 font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-64 text-center text-gray-400">
                No {type} reports found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((report) => (
              <TableRow key={report.id} className="border-[#1a1a1a] hover:bg-[#111]/30 transition-colors">
                <TableCell>
                  {type === 'abuse' ? (
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{report.qr_codes?.name || 'Deleted QR'}</span>
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">/{report.qr_codes?.short_code}</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 capitalize">
                      {report.type}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                     {type === 'abuse' && <ShieldAlert className="h-3.5 w-3.5 text-red-500" />}
                     {type === 'feedback' && <MessageSquare className="h-3.5 w-3.5 text-blue-500" />}
                     <span className="text-gray-300 text-sm">{type === 'abuse' ? report.reason : report.subject}</span>
                   </div>
                </TableCell>
                <TableCell className="text-gray-400 text-xs">
                  {report.users?.email || report.user_email || 'Anonymous'}
                </TableCell>
                <TableCell className="text-gray-500 text-xs font-medium">
                  {format(new Date(report.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {getStatusBadge(report.status)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#222] text-white">
                      <DropdownMenuItem 
                        className="focus:bg-[#111] focus:text-white cursor-pointer" 
                        onClick={() => handleViewDetails(report)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {report.status === 'pending' && (
                        <DropdownMenuItem 
                          className="focus:bg-[#111] focus:text-white cursor-pointer"
                          onClick={() => handleStatusUpdate(report.id, 'reviewed')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" />
                          Mark Reviewed
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="focus:bg-[#111] focus:text-white cursor-pointer"
                        onClick={() => handleStatusUpdate(report.id, 'actioned')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Mark Actioned
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="focus:bg-[#111] focus:text-white cursor-pointer"
                        onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                      >
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        Dismiss
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#222]" />
                      <DropdownMenuItem 
                        className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-500"
                        onClick={() => {
                          setReportToDelete(report.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ReportDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={selectedReport}
        type={type}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a0a0a] border border-[#222] text-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Are you sure you want to delete this abuse report?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the report and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-[#111] border-[#222] text-white hover:bg-[#1a1a1a] rounded-xl"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <Button 
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold px-6"
              onClick={() => reportToDelete && handleDelete(reportToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Report'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
