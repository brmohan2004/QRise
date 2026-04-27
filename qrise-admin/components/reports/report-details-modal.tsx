import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { AlertTriangle, ExternalLink, User, Calendar, ShieldAlert } from 'lucide-react'

interface ReportDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  report: any
  type: 'abuse'
}

export function ReportDetailsModal({ isOpen, onClose, report, type }: ReportDetailsModalProps) {
  if (!report) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              <AlertTriangle className="h-3 w-3 mr-1" /> Abuse Report
            </Badge>
            <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20 uppercase text-[10px]">
              {report.status}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold">
            Abuse: {report.reason}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Report ID: {report.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] p-4 rounded-2xl border border-[#1a1a1a]">
              <div className="flex items-center text-gray-500 text-xs mb-1">
                <User className="h-3 w-3 mr-1" /> Reported By
              </div>
              <div className="text-sm font-medium">{report.users?.email || 'Anonymous'}</div>
            </div>
            <div className="bg-[#111] p-4 rounded-2xl border border-[#1a1a1a]">
              <div className="flex items-center text-gray-500 text-xs mb-1">
                <Calendar className="h-3 w-3 mr-1" /> Date Reported
              </div>
              <div className="text-sm font-medium">
                {format(new Date(report.created_at), 'PPP p')}
              </div>
            </div>
          </div>

          <div className="bg-[#111] p-6 rounded-2xl border border-[#1a1a1a] space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Target QR Code</h4>
              <div className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded-xl border border-[#1a1a1a]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{report.qr_codes?.name || 'Deleted QR'}</span>
                  <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">/{report.qr_codes?.short_code}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#111]" asChild>
                  <a href={`/qr-codes/${report.qr_id}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Report Reason</h4>
              <div className="flex items-start gap-2 text-red-400 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                <ShieldAlert className="h-4 w-4 mt-0.5" />
                <p className="text-sm">{report.reason}</p>
              </div>
            </div>
          </div>

          {(report.action_taken || report.resolution_notes) && (
            <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/10">
              <h4 className="text-xs font-bold text-green-500/80 uppercase mb-2">Action Taken</h4>
              <p className="text-sm text-gray-300">
                {report.action_taken}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}