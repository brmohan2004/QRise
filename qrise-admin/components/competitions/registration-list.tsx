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
import { 
  XCircle, 
  Download, 
  FileJson,
  MoreVertical,
  UserCheck
} from 'lucide-react'
import { format } from 'date-fns'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Registration {
  id: string
  email: string
  form_data: Record<string, unknown>
  status: 'registered' | 'confirmed' | 'disqualified'
  created_at: string
}

export function RegistrationList({ registrations }: { registrations: Registration[] }) {
  const exportCSV = () => {
    const headers = ['Email', 'Status', 'Date', ...Object.keys(registrations[0]?.form_data || {})]
    const rows = registrations.map(r => [
      r.email,
      r.status,
      r.created_at,
      ...Object.values(r.form_data || {})
    ])
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'registrations.csv'
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Registrations ({registrations.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-transparent border-[#222] text-gray-400 hover:text-white"
          onClick={exportCSV}
        >
          <Download className="h-3 w-3 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#111]">
            <TableRow className="border-[#1a1a1a] hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-bold text-gray-400">User</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-gray-400">Status</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-gray-400">Registered</TableHead>
              <TableHead className="text-right text-[10px] uppercase font-bold text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-gray-500 italic">
                  No registrations found yet.
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow key={reg.id} className="border-[#111] hover:bg-white/[0.02]">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{reg.email}</span>
                      <span className="text-[10px] text-gray-500">
                        {Object.entries(reg.form_data || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[9px] uppercase ${
                      reg.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                      reg.status === 'registered' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {reg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {format(new Date(reg.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#222] text-white">
                        <DropdownMenuItem className="text-xs flex items-center gap-2">
                           <UserCheck className="h-3 w-3 text-green-500" />
                           Confirm Attendance
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs flex items-center gap-2">
                           <FileJson className="h-3 w-3 text-blue-500" />
                           View Form Data
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs flex items-center gap-2 text-red-500">
                           <XCircle className="h-3 w-3" />
                           Disqualify
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
