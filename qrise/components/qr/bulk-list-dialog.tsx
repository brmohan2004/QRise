"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutGrid, BarChart2, Edit2, Copy, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface BulkListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qr: any;
}

export function BulkListDialog({ open, onOpenChange, qr }: BulkListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl border-none">
        <DialogHeader className="p-8 bg-[#0F6E56] text-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <LayoutGrid className="w-8 h-8" />
                Bulk Batch: {qr.name}
              </DialogTitle>
              <DialogDescription className="text-emerald-50/70 text-base mt-1">
                Collection of {qr.items?.length} QR codes generated in this batch.
              </DialogDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{qr.scanCount || 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Scans</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
          {qr.items?.map((item: any, idx: number) => (
            <div key={item.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#0F6E56]/30 hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400 border border-gray-100 group-hover:bg-[#0F6E56]/5 group-hover:text-[#0F6E56] transition-colors">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[300px] font-mono opacity-60">{item.targetUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4 hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{item.scanCount || 0}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Scans</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/qr-codes/${item.id}/analytics`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#0F6E56] transition-colors">
                    <BarChart2 className="w-5 h-5" />
                  </Link>
                  <Link href={`/create/${item.type}?edit=${item.id}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#0F6E56] transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/s/${item.shortCode || item.id}`);
                      toast.success("Link copied");
                    }} 
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#0F6E56] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter className="p-6 bg-white border-t flex items-center justify-between sm:justify-between">
          <p className="text-xs text-gray-400">Created on {new Date(qr.createdAt).toLocaleDateString()}</p>
          <Button onClick={() => onOpenChange(false)} className="bg-gray-900 text-white rounded-xl">Close Batch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
