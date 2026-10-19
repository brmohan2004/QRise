"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Pencil, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { EditLabelDialog } from "./edit-label-dialog";
import { cn } from "@/lib/utils";

interface CreateLabelHeaderProps {
  labelName?: string;
  onLabelNameChange?: (name: string) => void;
  labelDescription?: string;
  onLabelDescriptionChange?: (desc: string) => void;
  projectName?: string;
  projectId?: string;
  onSave?: () => void;
  isSaving?: boolean;
  autoSave?: boolean;
  onAutoSaveChange?: (val: boolean) => void;
  lastSavedAt?: Date | null;
}

export function CreateLabelHeader({
  labelName = "Shipping Barcode Label",
  onLabelNameChange,
  labelDescription = "Standard 4x6 thermal shipping label template",
  onLabelDescriptionChange,
  projectName = "Courier Tracking",
  projectId = "courier-tracking",
  onSave,
  isSaving = false,
  autoSave = true,
  onAutoSaveChange,
  lastSavedAt,
}: CreateLabelHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleSaveEdit = (newName: string, newDesc: string) => {
    onLabelNameChange?.(newName);
    onLabelDescriptionChange?.(newDesc);
    toast.success("Label details updated");
  };

  return (
    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
      {/* Left: Back + Editable Label Name & Description */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href={`/qrise-matrix/projects/${projectId}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
            aria-label="Back to project"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        {/* Label Name & Description Trigger */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            onClick={() => setIsEditOpen(true)}
            className="group cursor-pointer min-w-0 pr-1 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 p-1.5 rounded-xl transition-colors text-left"
            title="Click to edit label name & description"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsEditOpen(true);
              }
            }}
          >
            <div className="flex items-center gap-1.5 max-w-full">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                {labelName}
              </h1>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500/10 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0">
                <Pencil className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[170px] sm:max-w-xs md:max-w-md">
              {labelDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Label Modal / Bottom Sheet */}
      <EditLabelDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        labelName={labelName}
        labelDescription={labelDescription}
        onSave={handleSaveEdit}
      />

      {/* Right: Auto Save Toggle Switch & Save Button (Preview and Share removed) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Auto Save Toggle */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <label 
            htmlFor="auto-save-switch" 
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
          >
            {isSaving ? (
              <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
            ) : autoSave ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            )}
            <span className="hidden xs:inline sm:inline">Auto-save</span>
          </label>
          <Switch
            id="auto-save-switch"
            checked={autoSave}
            onCheckedChange={(checked) => {
              onAutoSaveChange?.(checked);
              toast.info(checked ? "Auto-save enabled" : "Auto-save disabled");
            }}
            className="data-checked:bg-emerald-600"
          />
        </div>

        {/* Manual Save Button */}
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? "Saving..." : "Save"}</span>
        </Button>
      </div>
    </div>
  );
}
