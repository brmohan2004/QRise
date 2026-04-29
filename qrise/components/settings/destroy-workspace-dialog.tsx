"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DestroyWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DestroyWorkspaceDialog({ isOpen, onClose, onConfirm }: DestroyWorkspaceDialogProps) {
  const [countdown, setCountdown] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Failed to destroy workspace:", error);
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
            <h3 className="text-xl font-black text-slate-900">Destroy Workspace?</h3>
            <p className="text-sm font-medium text-slate-500 px-4">
              This will permanently destroy your workspace and all associated data. You will no longer be able to access your dashboard.
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
            {countdown > 0 ? (
               <Button
               disabled
               className="flex-1 h-12 rounded-xl font-bold bg-slate-100 text-slate-400 border-none"
             >
               Wait {countdown}s
             </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-1 h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Destroy Now"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
