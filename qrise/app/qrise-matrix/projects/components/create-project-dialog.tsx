"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Truck, 
  HeartPulse, 
  ShoppingBag, 
  Warehouse, 
  Factory, 
  Apple, 
  Ticket,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: any) => void;
}

const INDUSTRIES = [
  { id: "Postal & Tracking", name: "Postal & Tracking", icon: Truck },
  { id: "Healthcare & Hospitals", name: "Healthcare & Hospitals", icon: HeartPulse },
  { id: "Retail & Supermarkets", name: "Retail & Supermarkets", icon: ShoppingBag },
  { id: "Logistics, Shipping and Warehousing", name: "Logistics & Warehousing", icon: Warehouse },
  { id: "Manufacturing & Automotive", name: "Manufacturing & Automotive", icon: Factory },
  { id: "Food, Agriculture and Produce", name: "Food & Agriculture", icon: Apple },
  { id: "Entertainment and Events", name: "Entertainment & Events", icon: Ticket },
];

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Postal & Tracking");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Industrial Project
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Select an industry sector and configure barcode workflows.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Project Name <span className="text-emerald-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Express Courier Tracking"
              className="rounded-xl h-10 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
              required
            />
          </div>

          {/* Industry Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Industry Sector
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar p-0.5">
              {INDUSTRIES.map((ind) => {
                const Icon = ind.icon;
                const isSelected = industry === ind.id;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => setIndustry(ind.id)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all text-xs font-semibold",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate">{ind.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about parcel tracking, shelf barcodes, or hospital asset tags."
              className="rounded-xl min-h-[70px] text-xs sm:text-sm border-slate-200 dark:border-slate-800 resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 text-xs font-bold border-slate-200 dark:border-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-xs font-bold shadow-sm shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4 mr-1" />
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
