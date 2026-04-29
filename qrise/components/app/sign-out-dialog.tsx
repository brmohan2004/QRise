"use client";

import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface SignOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function SignOutDialog({ isOpen, onClose, onConfirm }: SignOutDialogProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirm = async () => {
    setIsSigningOut(true);
    try {
      await onConfirm();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 border-none rounded-3xl overflow-hidden shadow-2xl bg-white">
        <div className="p-8 space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
            <LogOut className="h-8 w-8" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-slate-900">Sign out?</h3>
            <p className="text-sm font-medium text-slate-500 px-4">
              Are you sure you want to sign out of your account? You will need to log in again to access your dashboard.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSigningOut}
              className="flex-1 h-12 rounded-xl font-bold border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSigningOut}
              className="flex-1 h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100"
            >
              {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign out"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
