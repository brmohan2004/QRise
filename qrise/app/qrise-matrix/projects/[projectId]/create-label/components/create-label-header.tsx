"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Share2, Save, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CreateLabelHeaderProps {
  labelName?: string;
  onLabelNameChange?: (name: string) => void;
  labelDescription?: string;
  onLabelDescriptionChange?: (desc: string) => void;
  projectName?: string;
  projectId?: string;
  onSave?: () => void;
  onPreview?: () => void;
  onShare?: () => void;
  isSaving?: boolean;
}

export function CreateLabelHeader({
  labelName = "Shipping Barcode Label",
  onLabelNameChange,
  labelDescription = "Standard 4x6 thermal shipping label template",
  onLabelDescriptionChange,
  projectName = "Courier Tracking",
  projectId = "courier-tracking",
  onSave,
  onPreview,
  onShare,
  isSaving = false,
}: CreateLabelHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(labelName);
  const [tempDesc, setTempDesc] = useState(labelDescription);

  const handleSaveEdit = () => {
    if (tempName.trim()) {
      onLabelNameChange?.(tempName.trim());
    }
    if (tempDesc.trim()) {
      onLabelDescriptionChange?.(tempDesc.trim());
    }
    setIsEditing(false);
    toast.success("Label details updated");
  };

  const handleCancelEdit = () => {
    setTempName(labelName);
    setTempDesc(labelDescription);
    setIsEditing(false);
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

        {isEditing ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="space-y-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="text-xs sm:text-sm font-extrabold bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg px-2 py-0.5 outline-none text-slate-900 dark:text-white w-48 sm:w-60 shadow-xs"
                placeholder="Label Name"
                autoFocus
              />
              <input
                type="text"
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="text-[10px] sm:text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 outline-none text-slate-600 dark:text-slate-400 w-48 sm:w-60"
                placeholder="Label Description"
              />
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
                title="Save"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="group cursor-pointer min-w-0 pr-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-1 rounded-xl transition-colors"
            title="Click to edit label name & description"
          >
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                {labelName}
              </h1>
              <Pencil className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
              {labelDescription}
            </p>
          </div>
        )}
      </div>

      {/* Right: Preview, Share, Save */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Preview Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onPreview}
          className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-xs"
          title="Print Preview"
        >
          <Eye className="w-4 h-4" />
        </Button>

        {/* Share Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onShare}
          className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-xs"
          title="Share Template"
        >
          <Share2 className="w-4 h-4" />
        </Button>

        {/* Save Button */}
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving..." : "Save"}</span>
        </Button>
      </div>
    </div>
  );
}
