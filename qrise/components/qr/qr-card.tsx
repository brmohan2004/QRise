"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from 'next/link';
import { Edit2, BarChart2, Copy, Download, Trash, Globe, MapPin, MoreHorizontal, Eye, LayoutGrid } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DynamicBadge } from "./dynamic-badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { BulkListDialog } from "./bulk-list-dialog";
import { ActionMenu } from "./action-menu";
import { DeleteConfirmDialog, QrPreviewDialog, StatusConfirmDialog } from "./qr-card-dialogs";

interface QrCardProps {
  qr: any;
  view?: "grid" | "list";
  onToggleStatus?: (id: string, isActive: boolean) => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  selectionMode?: boolean;
}

export function QrCard({
  qr,
  view = "grid",
  onToggleStatus,
  isSelected = false,
  onSelect,
  selectionMode = false
}: QrCardProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<boolean>(false);
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);


  // Generate QR code image on mount
  useEffect(() => {
    async function generateQR() {
      try {
        const shortCode = qr.shortCode || qr.id;
        const url = `${window.location.origin}/s/${shortCode}`;
        const QRCodes = (await import("qr-code-styling")).default;

        const design = qr.designConfig || {};

        const qrCode = new QRCodes({
          width: 300,
          height: 300,
          data: url,
          imageOptions: {
            crossOrigin: "anonymous",
            margin: 10,
          },
          dotsOptions: {
            color: design.dotColor || "#000000",
            type: (design.dotStyle || "square").replace("_", "-") as any,
          },
          backgroundOptions: {
            color: design.bgColor || "#ffffff",
          },
          cornersSquareOptions: {
            color: design.eyeColor || design.dotColor || "#000000",
            type: (design.eyeStyle || "square") as any,
          },
          cornersDotOptions: {
            color: design.eyeColor || design.dotColor || "#000000",
            type: design.eyeStyle === 'square' ? 'square' : 'dot' as any,
          },
          image: design.logoUrl,
          type: "svg",
        } as any);

        const blob = await qrCode.getRawData("png");
        if (blob instanceof Blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setQrImageUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      } catch (err) {
        console.error("QR generation error:", err);
      }
    }
    generateQR();
  }, [qr.shortCode, qr.id, qr.designConfig]);

  const handleCopy = async () => {
    const shortCode = qr.shortCode || qr.id;
    const url = `${window.location.origin}/s/${shortCode}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/qr/${qr.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("QR Code deleted successfully");
        setShowDeleteConfirm(false);
        // Refresh the data without reloading the whole page
        queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
      } else {
        toast.error("Failed to delete QR code");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("An error occurred while deleting the QR code");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = (checked: boolean) => {
    setPendingStatus(checked);
    setShowStatusConfirm(true);
  };

  const confirmToggleStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      await onToggleStatus?.(qr.id, pendingStatus);
      setShowStatusConfirm(false);
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const [showBulkList, setShowBulkList] = useState(false);

  return (
    <>
      {view === "list" ? (
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white border rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group",
          isSelected && "border-[#0F6E56] ring-1 ring-[#0F6E56]/10 bg-emerald-50/10",
          qr.isBulk && "border-l-4 border-l-[#0F6E56]"
        )}>
          {/* Selection and Main Content */}
          <div className="flex items-center gap-4 flex-1">
            {(selectionMode || isSelected) && (
              <div className="shrink-0">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelect?.(qr.id, !!checked)}
                  className="data-[state=checked]:bg-[#0F6E56] data-[state=checked]:border-[#0F6E56] shadow-sm"
                />
              </div>
            )}
            
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center border border-gray-100 shadow-sm relative group-hover:border-emerald-100 transition-colors">
              {qr.isBulk ? (
                <div className="relative">
                  <LayoutGrid className="w-7 h-7 text-[#0F6E56]" />
                  <span className="absolute -top-2 -right-2 bg-white border border-[#0F6E56]/20 text-[#0F6E56] text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                    {qr.items?.length}
                  </span>
                </div>
              ) : qrImageUrl ? (
                <img src={qrImageUrl} alt={qr.name} className="w-10 h-10 object-contain" />
              ) : (
                <Globe className="w-6 h-6 text-gray-300" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                  {qr.isBulk ? qr.name || 'Batch Upload' : qr.name || 'Untitled QR'}
                </h3>
                <DynamicBadge isDynamic={qr.isDynamic} className="scale-90 origin-left" />
              </div>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Globe className="w-3 h-3 text-emerald-600/60" />
                  {qr.isBulk ? 'BULK' : (qr.type || 'URL')}
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <BarChart2 className="w-3 h-3 text-emerald-600/60" />
                  {qr.scanCount || 0} scans
                </span>
              </div>
            </div>
          </div>

          {/* Actions and Status */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 mt-1 sm:mt-0">
            <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-full border border-gray-100 shadow-sm">
              <Switch
                checked={qr.isActive}
                onCheckedChange={handleToggleStatus}
                className="scale-[0.6] data-[state=checked]:bg-emerald-500 origin-left"
              />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest min-w-[45px]",
                qr.isActive ? "text-emerald-600" : "text-gray-400"
              )}>
                {qr.isActive ? "Active" : "Paused"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {qr.isBulk ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowBulkList(true)} 
                  className="h-8 rounded-xl px-3 text-[9px] font-black uppercase tracking-widest text-emerald-600 border-emerald-100 bg-white hover:bg-emerald-50 transition-all shadow-sm"
                >
                  View Batch
                </Button>
              ) : (
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={() => setShowQrPreview(true)} 
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <Link 
                    href={`/qr-codes/${qr.id}/analytics`} 
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Analytics"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </Link>
                </div>
              )}
              <ActionMenu onCopy={handleCopy} onDelete={handleDelete} qrId={qr.id} type={qr.type} isBulk={qr.isBulk} />
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(
          "group flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all relative",
          isSelected && "border-[#0F6E56] ring-1 ring-[#0F6E56]/10 bg-emerald-50/10",
          qr.isBulk && "after:absolute after:inset-0 after:border-2 after:border-[#0F6E56]/20 after:rounded-xl after:-translate-x-1 after:-translate-y-1 after:-z-10 before:absolute before:inset-0 before:border-2 before:border-[#0F6E56]/10 before:rounded-xl before:-translate-x-2 before:-translate-y-2 before:-z-20 ml-2 mt-2"
        )}>
          {(selectionMode || isSelected) && (
            <div className="absolute top-3 right-3 z-20">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect?.(qr.id, !!checked)}
                className="data-[state=checked]:bg-[#0F6E56] data-[state=checked]:border-[#0F6E56] shadow-sm bg-white/80 backdrop-blur-sm"
              />
            </div>
          )}
          <div className="relative aspect-square bg-gray-50 p-6 flex items-center justify-center">
            {qr.isBulk ? (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <LayoutGrid className="w-12 h-12 text-[#0F6E56]" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{qr.items?.length} QR CODES</p>
              </div>
            ) : qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt={qr.name || "QR Code"}
                className="w-full h-full max-w-[200px] max-h-[200px] object-contain"
              />
            ) : (
              <div className="w-full h-full max-w-[200px] bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                Loading...
              </div>
            )}
            <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
              {qr.isBulk ? (
                <Button onClick={() => setShowBulkList(true)} className="bg-white text-gray-900 hover:bg-gray-100 rounded-full font-bold gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  View Batch
                </Button>
              ) : (
                <>
                  <button onClick={() => setShowQrPreview(true)} className="p-2.5 bg-white rounded-full hover:scale-110">
                    <Eye className="w-5 h-5 text-gray-700" />
                  </button>
                  <Link href={`/qr-codes/${qr.id}/analytics`} className="p-2.5 bg-white rounded-full hover:scale-110">
                    <BarChart2 className="w-5 h-5 text-gray-700" />
                  </Link>
                  <Link href={`/create/${qr.type}?edit=${qr.id}`} className="p-2.5 bg-white rounded-full hover:scale-110">
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button onClick={handleCopy} className="p-2.5 bg-white rounded-full hover:scale-110">
                    <Copy className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <div className="absolute top-3 left-3 bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <Globe className="w-3 h-3" /> {qr.isBulk ? 'BULK' : (qr.type?.toUpperCase() || 'URL')}
            </div>
          </div>
          <div className="p-3 sm:p-4 flex-1 flex flex-col border-t">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm sm:text-base line-clamp-1 flex-1">
                {qr.isBulk ? `[Batch] ${qr.name || 'Bulk Upload'}` : (qr.name || 'Untitled QR')}
              </h3>
              <div className="flex items-center gap-1.5 ml-2">
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors",
                  qr.isActive ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100"
                )}>
                  <Switch
                    checked={qr.isActive}
                    onCheckedChange={handleToggleStatus}
                    className="scale-75 data-[state=checked]:bg-emerald-500"
                  />
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block",
                    qr.isActive ? "text-emerald-600" : "text-gray-400"
                  )}>
                    {qr.isActive ? "Active" : "Paused"}
                  </span>
                </div>
                <ActionMenu onCopy={handleCopy} onDelete={handleDelete} qrId={qr.id} type={qr.type} isBulk={qr.isBulk} />
              </div>
            </div>
            <div className="mt-auto flex justify-between text-[11px] sm:text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{qr.scanCount || 0} total scans</span>
              <DynamicBadge isDynamic={qr.isDynamic !== false} className="scale-90 origin-right" />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Job Details Dialog */}
      <BulkListDialog open={showBulkList} onOpenChange={setShowBulkList} qr={qr} />

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        qrName={qr.name}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
      />

      <QrPreviewDialog
        open={showQrPreview}
        onOpenChange={setShowQrPreview}
        qr={qr}
        qrImageUrl={qrImageUrl}
        onCopy={handleCopy}
      />

      <StatusConfirmDialog
        open={showStatusConfirm}
        onOpenChange={setShowStatusConfirm}
        qrName={qr.name}
        pendingStatus={pendingStatus}
        isUpdatingStatus={isUpdatingStatus}
        onConfirm={confirmToggleStatus}
      />
    </>
  );
}