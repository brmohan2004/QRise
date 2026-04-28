'use client'

import { 
  MoreHorizontal, 
  Trash2, 
  HelpCircle,
  Trophy,
  Globe
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'

interface Quiz {
  id: string
  feature_name: string
  hint_text: string
  correct_guesses: number
  is_visible: boolean
  is_revealed: boolean
}

interface QuizTableProps {
  data: Quiz[]
  onUpdate: () => void
}

export function QuizTable({ data, onUpdate }: QuizTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const handleUpdateStatus = async (id: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/admin/features-quiz/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) throw new Error('Failed to update')
      toast.success('Status updated')
      onUpdate()
    } catch {
      toast.error('Error updating quiz')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/features-quiz/${deleteId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Deleted successfully')
      onUpdate()
    } catch {
      toast.error('Error deleting')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden">
      <Table>
        <TableHeader className="bg-[#111]/50">
          <TableRow className="border-[#1a1a1a] hover:bg-transparent">
            <TableHead className="text-gray-400 font-bold">Feature Name</TableHead>
            <TableHead className="text-gray-400 font-bold">Hint Text</TableHead>
            <TableHead className="text-gray-400 font-bold">Guesses</TableHead>
            <TableHead className="text-gray-400 font-bold">Visibility</TableHead>
            <TableHead className="text-gray-400 font-bold">Status</TableHead>
            <TableHead className="text-right text-gray-400 font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-20 text-gray-500 font-medium">
                No quiz features found. Add one to engage users.
              </TableCell>
            </TableRow>
          ) : (
            data.map((quiz) => (
              <TableRow key={quiz.id} className="border-[#1a1a1a] hover:bg-[#111]/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <HelpCircle className="h-5 w-5 text-blue-500" />
                     </div>
                     <span className="text-white font-bold">{quiz.feature_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-400 text-xs max-w-[200px] truncate">
                  {quiz.hint_text}
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-white font-bold">{quiz.correct_guesses}</span>
                   </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                      <Switch 
                        checked={quiz.is_visible} 
                        onCheckedChange={(val: boolean) => handleUpdateStatus(quiz.id, { is_visible: val })}
                      />
                      <span className="text-[10px] uppercase font-bold text-gray-500">
                        {quiz.is_visible ? 'Public' : 'Hidden'}
                      </span>
                   </div>
                </TableCell>
                <TableCell>
                   {quiz.is_revealed ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 uppercase text-[9px] font-black">Revealed</Badge>
                   ) : (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[9px] font-black">Active Quiz</Badge>
                   )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-[#222] text-white">
                      {!quiz.is_revealed && (
                        <DropdownMenuItem 
                          className="focus:bg-[#111] focus:text-white cursor-pointer"
                          onClick={() => handleUpdateStatus(quiz.id, { is_revealed: true })}
                        >
                          <Globe className="h-4 w-4 mr-2 text-green-500" />
                          Reveal Feature
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="focus:bg-[#111] focus:text-red-500 cursor-pointer text-red-500"
                        onClick={() => setDeleteId(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Quiz?"
        description="Are you sure you want to delete this feature quiz? This action cannot be undone."
        confirmText="Delete Now"
        variant="danger"
      />
    </div>
  )
}
