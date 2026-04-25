"use client";

import { Check, Copy, QrCode } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QRSavePromptProps {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  savedFormId?: string;
  onOpenWorkflow: () => void;
}

export function QRSavePrompt({ isOpen, onClose, savedFormId, onOpenWorkflow }: QRSavePromptProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-none rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-[#0F6E56] p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Form Saved!</h2>
          <p className="text-white/70">What would you like to do next?</p>
        </div>

        <div className="p-8">
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const formUrl = typeof window !== 'undefined' ? `${window.location.origin}/f/${savedFormId || 'form-id'}` : '';
                navigator.clipboard.writeText(formUrl);
                toast.success("Link copied to clipboard!");
              }}
              className="w-full gap-2 border-slate-200 h-12 rounded-xl"
            >
              <Copy className="h-4 w-4 text-[#0F6E56]" />
              Copy Form Link
            </Button>
            
            <Button
              onClick={onOpenWorkflow}
              className="w-full gap-2 bg-[#0F6E56] hover:bg-[#0d5c48] h-12 rounded-xl text-white font-bold"
            >
              <QrCode className="h-4 w-4" />
              Create Custom QR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
