"use client";

import { Download, Copy, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRPreview } from "@/components/qr/qr-preview";
import { toast } from "sonner";
import { RefObject } from "react";
import { QRPreviewHandle } from "@/components/qr/qr-preview";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  savedFormId: string | null;
  formName: string;
  qrRef: RefObject<QRPreviewHandle | null>;
}

export function ShareDialog({ isOpen, onClose, savedFormId, formName, qrRef }: ShareDialogProps) {
  const formUrl = typeof window !== 'undefined' ? `${window.location.origin}/f/${savedFormId || 'form-id'}` : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-none rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-[#0F6E56] p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Share Form</h2>
          <p className="text-white/70">Spread your form with a link or QR code.</p>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-[200px] h-[200px] bg-white border-2 border-slate-100 rounded-2xl p-2 flex items-center justify-center shadow-inner">
              <QRPreview
                ref={qrRef}
                data={formUrl}
                size={180}
                hideDownload
              />
            </div>
            
            <div className="w-full space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Form URL</label>
              <div className="relative">
                <Input
                  readOnly
                  value={formUrl}
                  className="bg-slate-50/50 border-slate-200 rounded-xl pr-12 h-11"
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-[#0F6E56] hover:bg-[#0F6E56]/5"
                  onClick={() => {
                    navigator.clipboard.writeText(formUrl);
                    toast.success("Link copied!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl gap-2 border-slate-200 hover:border-[#0F6E56]/30 hover:bg-[#0F6E56]/5 transition-all"
                onClick={() => qrRef.current?.download(formName)}
              >
                <Download className="h-4 w-4 text-slate-500" />
                Download QR Code
              </Button>
              
              <Button
                className="w-full h-12 rounded-xl gap-2 bg-[#0F6E56] hover:bg-[#0d5c48] text-white shadow-lg shadow-[#0F6E56]/20 transition-all"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: formName, url: formUrl });
                  } else {
                    navigator.clipboard.writeText(formUrl);
                    toast.success("Link copied!");
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Share with Others
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
