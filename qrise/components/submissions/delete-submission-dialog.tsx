"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteSubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteSubmissionDialog({ isOpen, onClose, onConfirm }: DeleteSubmissionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 border-none rounded-3xl overflow-hidden shadow-2xl bg-white">
        <div className="p-8 space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-slate-900">Delete Submission?</h3>
            <p className="text-sm font-medium text-slate-500 px-4">
              This action cannot be undone. All data associated with this response will be permanently removed.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 h-12 rounded-xl font-bold border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
