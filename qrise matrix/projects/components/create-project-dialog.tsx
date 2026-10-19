"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, FolderPlus, ChevronDown } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: any) => void;
}

const INDUSTRIES = [
  "Postal & Tracking",
  "Healthcare & Hospitals",
  "Retail & Supermarkets",
  "Logistics, Shipping and Warehousing",
  "Manufacturing & Automotive",
  "Food, Agriculture and Produce",
  "Entertainment and Events",
  "Electronics & Hardware",
  "General Commercial",
];

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive mobile screen check (< 640px)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset fields when opening
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setIndustry(INDUSTRIES[0]);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newProj = {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: name.trim(),
        industry,
        description: description.trim() || `Industrial management for ${industry}.`,
        labelsCount: 0,
        scansCount: "0",
        createdAt: "Just now",
        status: "Active",
      };

      onProjectCreated?.(newProj);
      toast.success(`Project "${name}" created successfully!`);
      setIsSubmitting(false);
      setName("");
      setDescription("");
      onOpenChange(false);
    }, 400);
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* 1. Project Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Project Name <span className="text-emerald-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Courier Tracking"
          className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold"
          required
        />
      </div>

      {/* 2. Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Description <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Track shipments, deliveries and parcel movements."
          className="rounded-xl min-h-[75px] text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none font-medium"
        />
      </div>

      {/* 3. Industry Dropdown Menu */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Industry
        </label>
        <div className="relative">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full h-10 rounded-xl px-3.5 pr-9 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-emerald-500"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="rounded-xl h-10 px-4 text-xs font-bold border-slate-200 dark:border-slate-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 text-xs font-bold shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isSubmitting ? "Creating..." : "Create Project"}</span>
        </Button>
      </div>
    </form>
  );

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="rounded-t-[32px] p-5 pb-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader className="text-left px-0 pt-0 pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <FolderPlus className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <SheetTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                  Create Project
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Enter project name, description and industry
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <FormContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dialog Popup
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <FolderPlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
                Create Project
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Enter project name, description and industry
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <FormContent />
      </DialogContent>
    </Dialog>
  );
}
