"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { 
  FileText, 
  Edit2, 
  Eye, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  Calendar,
  Copy,
  BarChart2,
  ExternalLink as ShareIcon,
  MoreHorizontal
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormCardProps {
  form: any;
  onEdit: (form: any) => void;
  onDelete: (id: string) => Promise<any>;
  onDuplicate: (form: any) => void;
  onShare: (form: any) => void;
  onToggleStatus?: (id: string, isActive: boolean) => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  selectionMode?: boolean;
  viewMode?: "grid" | "list";
}

export function FormCard({ 
  form, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onShare, 
  onToggleStatus,
  isSelected = false,
  onSelect,
  selectionMode = false,
  viewMode = "grid"
}: FormCardProps) {
  const router = useRouter();
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleToggleStatus = (checked: boolean) => {
    setPendingStatus(checked);
    setShowStatusConfirm(true);
  };

  const confirmToggleStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      await onToggleStatus?.(form.id, pendingStatus);
      setShowStatusConfirm(false);
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (viewMode === "list") {
    return (
      <>
        <div className={cn(
          "group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex items-center p-3 sm:p-4 gap-3 sm:gap-4",
          isSelected && "border-[#0F6E56] ring-1 ring-[#0F6E56]/10 bg-emerald-50/10"
        )}>
          {(selectionMode || isSelected) && (
            <div className="flex-shrink-0">
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={(checked) => onSelect?.(form.id, !!checked)}
                className="data-[state=checked]:bg-[#0F6E56] data-[state=checked]:border-[#0F6E56]"
              />
            </div>
          )}
          
          <div className="w-12 h-12 bg-[#0F6E56]/5 rounded-xl flex items-center justify-center text-[#0F6E56] flex-shrink-0">
            <FileText className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate group-hover:text-[#0F6E56] transition-colors">
                {form.name}
              </h3>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                form.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
              )}>
                {form.isActive ? "Active" : "Disabled"}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <Calendar className="h-3 w-3" />
                {format(new Date(form.createdAt), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <MessageSquare className="h-3 w-3" />
                {form.submissionCount || 0} submissions
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              checked={form.isActive} 
              onCheckedChange={handleToggleStatus}
              className={cn(
                "scale-75",
                form.isActive ? "data-[state=checked]:bg-emerald-600" : ""
              )}
            />
            <ActionMenu 
              form={form} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onDuplicate={onDuplicate} 
              onShare={onShare} 
            />
          </div>
        </div>

        {/* Reuse the same Status Confirm Dialog */}
        <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {pendingStatus ? "Activate Form" : "Deactivate Form"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 pt-2">
                Are you sure you want to {pendingStatus ? "activate" : "deactivate"} <span className="font-semibold text-gray-700">"{form.name}"</span>? 
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowStatusConfirm(false)} disabled={isUpdatingStatus}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={confirmToggleStatus} 
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
      </>
    );
  }

  return (
    <>
    <div className={cn(
      "group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300",
      isSelected && "border-[#0F6E56] ring-1 ring-[#0F6E56]/10 bg-emerald-50/10"
    )}>
      {(selectionMode || isSelected) && (
        <div className="absolute top-4 right-4 z-20">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={(checked) => onSelect?.(form.id, !!checked)}
            className="data-[state=checked]:bg-[#0F6E56] data-[state=checked]:border-[#0F6E56] shadow-sm bg-white/80 backdrop-blur-sm"
          />
        </div>
      )}
      {/* Top Preview Section (Stylized Form Preview) */}
      <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
        {/* Stylized Form Mockup */}
        <div className="w-[140px] bg-white rounded-xl shadow-sm border border-gray-100 p-3 space-y-2 transform group-hover:scale-105 transition-transform duration-500">
          <div className="h-2 w-12 bg-gray-100 rounded-full mb-3" />
          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-1 w-8 bg-gray-50 rounded-full" />
                <div className="h-4 w-full bg-gray-50 rounded-md border border-gray-100/50" />
              </div>
            ))}
          </div>
          <div className="h-6 w-full bg-[#0F6E56]/10 rounded-md mt-2" />
        </div>

        {/* Floating Icon Wrapper (Always visible unless hovered) */}
        <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-[#0F6E56] group-hover:opacity-0 transition-opacity">
          <FileText className="h-5 w-5" />
        </div>

        {/* Hover Overlay Actions */}
        <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
          <Link href={`/forms/${form.id}/submissions`} className="p-2.5 bg-white rounded-full hover:scale-110 transition-transform">
            <BarChart2 className="w-5 h-5 text-gray-700" />
          </Link>
          <button onClick={() => onEdit(form)} className="p-2.5 bg-white rounded-full hover:scale-110 transition-transform">
            <Edit2 className="w-5 h-5 text-gray-700" />
          </button>
          <Link href={`/f/${form.slug}`} target="_blank" className="p-2.5 bg-white rounded-full hover:scale-110 transition-transform">
            <Eye className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 sm:p-5">
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight group-hover:text-[#0F6E56] transition-colors line-clamp-1 flex-1">
              {form.name}
            </h3>
            <ActionMenu 
              form={form} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onDuplicate={onDuplicate} 
              onShare={onShare} 
            />
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
              <Calendar className="h-3 w-3" />
              {format(new Date(form.createdAt), "MMM d, yyyy")}
            </div>
            <div className={cn(
              "flex items-center gap-2 px-2 py-0.5 rounded-full transition-all duration-300",
              form.isActive ? "bg-emerald-50" : "bg-gray-50"
            )}>
              <Switch 
                checked={form.isActive} 
                onCheckedChange={handleToggleStatus}
                className={cn(
                  "scale-75",
                  form.isActive ? "data-[state=checked]:bg-emerald-600" : ""
                )}
              />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                form.isActive ? "text-emerald-600" : "text-gray-400"
              )}>
                {form.isActive ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Stats Section */}
        <div className="pt-3 sm:pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-[#0F6E56]/5 rounded-lg text-[#0F6E56]">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-gray-900 leading-none">{form.submissionCount || 0}</span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-tight">Submissions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link 
              href={`/forms/${form.id}/submissions`}
              className="p-2 text-gray-400 hover:text-[#0F6E56] hover:bg-[#0F6E56]/5 rounded-lg transition-colors"
              title="View Analytics"
            >
              <BarChart2 className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      </div>

      <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {pendingStatus ? "Activate Form" : "Deactivate Form"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 pt-2">
              Are you sure you want to {pendingStatus ? "activate" : "deactivate"} <span className="font-semibold text-gray-700">"{form.name}"</span>? 
              {pendingStatus 
                ? "This will make the form live and ready to accept new submissions." 
                : "This will temporarily disable the form. Users who visit the form link will see a disabled message."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowStatusConfirm(false)}
              disabled={isUpdatingStatus}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmToggleStatus}
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

    </>
  );
}

function ActionMenu({ 
  form, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onShare 
}: { 
  form: any; 
  onEdit: (form: any) => void; 
  onDelete: (id: string) => Promise<any>; 
  onDuplicate: (form: any) => void; 
  onShare: (form: any) => void; 
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(form.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-1 rounded-md hover:bg-gray-100 focus:outline-none transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-xl border-gray-100">
          <DropdownMenuItem 
            className="flex items-center gap-2 rounded-lg py-2 px-3 focus:bg-[#0F6E56]/5 focus:text-[#0F6E56] cursor-pointer"
            onClick={() => { window.location.href = `/forms/${form.id}/submissions`; }}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="font-medium text-sm">Submissions</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 rounded-lg py-2 px-3 focus:bg-[#0F6E56]/5 focus:text-[#0F6E56] cursor-pointer"
            onClick={() => onEdit(form)}
          >
            <Edit2 className="w-4 h-4" />
            <span className="font-medium text-sm">Edit Form</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 rounded-lg py-2 px-3 focus:bg-[#0F6E56]/5 focus:text-[#0F6E56] cursor-pointer"
            onClick={() => onShare(form)}
          >
            <ShareIcon className="w-4 h-4" />
            <span className="font-medium text-sm">Share Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 rounded-lg py-2 px-3 focus:bg-[#0F6E56]/5 focus:text-[#0F6E56] cursor-pointer"
            onClick={() => onDuplicate(form)}
          >
            <Copy className="w-4 h-4" />
            <span className="font-medium text-sm">Duplicate</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-gray-50" />
          <DropdownMenuItem 
            className="flex items-center gap-2 rounded-lg py-2 px-3 focus:bg-red-50 focus:text-red-600 text-red-600 cursor-pointer"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-medium text-sm">Delete Form</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Delete Form</DialogTitle>
            <DialogDescription className="text-gray-500 pt-2">
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{form.name}"</span>? 
              This action cannot be undone and all submissions associated with this form will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 hover:bg-red-700 font-medium text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
