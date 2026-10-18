"use client";

import React, { useState, useEffect } from "react";
import { Pencil, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelName: string;
  labelDescription: string;
  onSave: (name: string, description: string) => void;
}

export function EditLabelDialog({
  open,
  onOpenChange,
  labelName,
  labelDescription,
  onSave,
}: EditLabelDialogProps) {
  const [name, setName] = useState(labelName);
  const [description, setDescription] = useState(labelDescription);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (open) {
      setName(labelName);
      setDescription(labelDescription);
      setError(null);
    }
  }, [open, labelName, labelDescription]);

  // Responsive mobile screen check (< 640px)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Label name cannot be empty");
      return;
    }

    onSave(trimmedName, description.trim());
    handleClose();
  };

  const FormContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Pencil className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Label Template
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
              Edit Label Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Update the name and description for this custom label
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto">
        {/* Label Name Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="custom-label-name"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              Label Name <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] font-medium text-slate-400">
              {name.length}/60
            </span>
          </div>
          <Input
            id="custom-label-name"
            type="text"
            value={name}
            maxLength={60}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Shipping Barcode Label"
            className="h-10 text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
            autoFocus
          />
          {error && (
            <p className="text-xs font-semibold text-rose-500 mt-1 animate-in fade-in">
              {error}
            </p>
          )}
        </div>

        {/* Label Description Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="custom-label-desc"
              className="text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Description
            </label>
            <span className="text-[10px] font-medium text-slate-400">
              {description.length}/160
            </span>
          </div>
          <Textarea
            id="custom-label-desc"
            value={description}
            maxLength={160}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                handleSave();
              }
            }}
            placeholder="e.g. Standard 4x6 thermal shipping label template with tracking barcode and QR code"
            className="text-xs leading-relaxed rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 resize-none"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Displayed on printable exports and project dashboard previews.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="h-10 px-4 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 p-0 rounded-t-[32px] outline-none max-h-[85vh] overflow-hidden shadow-2xl"
        >
          <SheetTitle className="sr-only">Edit Label Details</SheetTitle>
          <SheetDescription className="sr-only">
            Update label name and description
          </SheetDescription>
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1" />
          <FormContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[480px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-0 text-slate-900 dark:text-white rounded-[24px] overflow-hidden outline-none shadow-2xl"
      >
        <DialogTitle className="sr-only">Edit Label Details</DialogTitle>
        <DialogDescription className="sr-only">
          Update label name and description
        </DialogDescription>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
}
