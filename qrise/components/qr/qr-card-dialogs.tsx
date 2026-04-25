"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface QrPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qr: any;
  qrImageUrl: string;
  onCopy: () => void;
}

export function QrPreviewDialog({ open, onOpenChange, qr, qrImageUrl, onCopy }: QrPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-3xl">
        <DialogHeader className="p-6 bg-gray-50 border-b">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#0F6E56]" />
            QR Code Preview
          </DialogTitle>
          <DialogDescription>
            {qr.name || 'Untitled QR'} • {qr.type?.toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="p-10 flex flex-col items-center justify-center bg-white">
          <div className="p-4 bg-white border-2 border-gray-100 rounded-3xl shadow-inner mb-6">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt={qr.name || "QR Code"}
                className="w-full h-full max-w-[280px] max-h-[280px] object-contain"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                Loading...
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Live URL</p>
              <p className="text-sm font-medium text-gray-700 break-all">
                {`${window.location.origin}/s/${qr.shortCode || qr.id}`}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onCopy}
                className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-800 text-white gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrImageUrl;
                  link.download = `${qr.name || 'qr-code'}.png`;
                  link.click();
                }}
                className="flex-1 rounded-xl bg-[#0F6E56] hover:bg-[#0d5c48] text-white gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrName: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, onOpenChange, qrName, isDeleting, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Delete QR Code</DialogTitle>
          <DialogDescription className="text-gray-500 pt-2">
            Are you sure you want to delete <span className="font-semibold text-gray-700">"{qrName || 'this QR'}"</span>?
            This action cannot be undone and all data associated with this QR will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 hover:bg-red-700 font-medium text-white"
          >
            {isDeleting ? "Deleting..." : "Delete QR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface StatusConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrName: string;
  pendingStatus: boolean;
  isUpdatingStatus: boolean;
  onConfirm: () => void;
}

export function StatusConfirmDialog({ open, onOpenChange, qrName, pendingStatus, isUpdatingStatus, onConfirm }: StatusConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {pendingStatus ? "Activate QR Code" : "Deactivate QR Code"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 pt-2">
            Are you sure you want to {pendingStatus ? "activate" : "deactivate"} <span className="font-semibold text-gray-700">"{qrName || 'this QR'}"</span>?
            {pendingStatus
              ? "This will make the QR code live and accessible to users."
              : "This will temporarily disable the QR code. Users who scan it will not be redirected."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdatingStatus}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isUpdatingStatus}
            className={cn(
              "rounded-xl font-medium text-white",
              pendingStatus ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
            )}
          >
            {isUpdatingStatus ? "Updating..." : (pendingStatus ? "Activate" : "Deactivate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
