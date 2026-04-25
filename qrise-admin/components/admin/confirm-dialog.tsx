'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger'
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#0a0a0a] border-[#222] text-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
              variant === 'danger' ? 'bg-red-500/10' : variant === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
            }`}>
              {variant === 'danger' ? <AlertTriangle className="h-6 w-6 text-red-500" /> : 
               variant === 'warning' ? <AlertTriangle className="h-6 w-6 text-amber-500" /> : 
               <Info className="h-6 w-6 text-blue-500" />}
            </div>
            <AlertDialogTitle className="text-xl font-bold">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel asChild>
            <Button variant="ghost" className="hover:bg-[#111] hover:text-white" disabled={isLoading} onClick={onClose}>
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              className={`font-bold px-8 ${
                variant === 'danger' ? 'bg-red-600 hover:bg-red-500' : 
                variant === 'warning' ? 'bg-amber-600 hover:bg-amber-500' : 
                'bg-blue-600 hover:bg-blue-500'
              } text-white`}
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault()
                onConfirm()
              }}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
