"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutGrid, BarChart2, Edit2, Copy, Download, Share2, FileArchive, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import QRCode from "qrcode";
import { zipSync } from "fflate";
import { QRPreview } from "./qr-preview";
import { useState } from "react";

interface BulkListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qr: any;
}

export function BulkListDialog({ open, onOpenChange, qr }: BulkListDialogProps) {
  const [previewItem, setPreviewItem] = useState<any>(null);

  const handleDownload = async (item: any) => {
    try {
      const url = `${window.location.origin}/s/${item.shortCode || item.id}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 1024, margin: 2 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${item.name || "qr"}.png`;
      link.click();
    } catch (err) {
      toast.error("Failed to generate QR code");
    }
  };

  const handleDownloadAllZip = async () => {
    const toastId = toast.loading("Generating zip file...");
    try {
      const files: Record<string, Uint8Array> = {};
      
      for (const item of qr.items || []) {
        const url = `${window.location.origin}/s/${item.shortCode || item.id}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 1024, margin: 2 });
        const base64 = dataUrl.split(",")[1];
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        files[`${item.name || "qr"}_${item.id.slice(0, 4)}.png`] = array;
      }
      
      const zipped = zipSync(files);
      const blob = new Blob([zipped as any], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `batch_${qr.name || "qrs"}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      toast.dismiss(toastId);
      toast.success("Zip downloaded successfully");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to create zip file");
    }
  };

  const handleShare = (item: any) => {
    const url = `${window.location.origin}/s/${item.shortCode || item.id}`;
    if (navigator.share) {
      navigator.share({
        title: item.name,
        url: url
      }).catch(() => {
        toast.error("Sharing failed");
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] sm:max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <DialogHeader className="p-5 sm:p-8 bg-emerald-900 text-white relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                <LayoutGrid className="w-6 h-6 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight truncate">
                  {qr.name || "Bulk Batch"}
                </DialogTitle>
                <DialogDescription className="text-emerald-200/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-0.5">
                  Collection of {qr.items?.length} QR Codes
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 border-t border-white/5 pt-4 sm:border-0 sm:pt-0">
              <div className="flex flex-col sm:items-end">
                <p className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">{qr.scanCount || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300/60 mt-1">Total Scans</p>
              </div>
              <Button 
                onClick={() => handleDownloadAllZip()}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/10 text-white gap-2 rounded-xl h-10 px-4 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
              >
                <FileArchive className="w-4 h-4" />
                Download Zip
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-gray-50/50">
          {qr.items?.map((item: any, idx: number) => (
            <div 
              key={item.id} 
              onClick={() => setPreviewItem(item)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-500/30 hover:shadow-md transition-all cursor-pointer relative"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 border border-gray-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0 text-xs">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate text-sm sm:text-base mb-0.5">{item.name || "Untitled QR"}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate font-medium opacity-80">{item.targetUrl}</p>
                </div>
                <div className="sm:hidden flex flex-col items-end shrink-0 ml-2">
                  <p className="text-base font-black text-gray-900 leading-none">{item.scanCount || 0}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Scans</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-50" onClick={(e) => e.stopPropagation()}>
                <div className="hidden sm:flex flex-col items-end mr-4">
                  <p className="text-sm font-black text-gray-900 leading-none">{item.scanCount || 0}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Scans</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/qr-codes/${item.id}/analytics`} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                    <BarChart2 className="w-4 h-4" />
                  </Link>
                  <Link href={`/create/${item.type}?edit=${item.id}`} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  <button 
                    onClick={() => handleDownload(item)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleShare(item)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/s/${item.shortCode || item.id}`);
                      toast.success("Link copied");
                    }} 
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter className="p-5 sm:p-6 bg-white border-t flex flex-row items-center justify-between gap-4">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Created On</p>
            <p className="text-xs font-bold text-gray-500">{new Date(qr.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <Button 
            onClick={() => onOpenChange(false)} 
            className="bg-gray-900 hover:bg-black text-white rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            Close Batch
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* QR Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">{previewItem?.name}</DialogTitle>
            <DialogDescription className="text-center truncate">
              {previewItem?.targetUrl}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <QRPreview 
              data={`${window.location.origin}/s/${previewItem?.shortCode || previewItem?.id}`}
              options={qr.designConfig}
              size={240}
              className="mx-auto"
            />
          </div>

          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={() => setPreviewItem(null)}
              className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 border-none rounded-xl"
            >
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
