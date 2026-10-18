"use client";

import React from "react";
import { Settings, X, Grid, Magnet, Check, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface CanvasSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showGrid: boolean;
  onToggleGrid: (val: boolean) => void;
  snapToElements: boolean;
  onToggleSnap: (val: boolean) => void;
  showMargins: boolean;
  onToggleMargins: (val: boolean) => void;
  onResetZoom: () => void;
  onResetPan?: () => void;
  zoom: number;
}

export function CanvasSettingsDialog({
  open,
  onOpenChange,
  showGrid,
  onToggleGrid,
  snapToElements,
  onToggleSnap,
  showMargins,
  onToggleMargins,
  onResetZoom,
  onResetPan,
  zoom,
}: CanvasSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-sm p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col"
      >
        <DialogTitle className="sr-only">Canvas Settings</DialogTitle>
        <DialogDescription className="sr-only">Configure label canvas display and snapping options</DialogDescription>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Settings className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                Canvas Preferences
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Layout & display controls</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-4">
          {/* 1. Toggle Alignment Grid */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Show Alignment Grid
              </span>
              <span className="text-[10px] text-slate-400 block">
                Displays blueprint grid background
              </span>
            </div>
            <Switch checked={showGrid} onCheckedChange={onToggleGrid} />
          </div>

          {/* 2. Magnetic Snap to Nearest Elements */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Smart Snap to Nearest Elements
              </span>
              <span className="text-[10px] text-slate-400 block">
                Shows guide lines when edges or centers align
              </span>
            </div>
            <Switch checked={snapToElements} onCheckedChange={onToggleSnap} />
          </div>

          {/* 3. Printable Safe Margins */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Print Safe Margins
              </span>
              <span className="text-[10px] text-slate-400 block">
                Dashed inset 3mm thermal margin border
              </span>
            </div>
            <Switch checked={showMargins} onCheckedChange={onToggleMargins} />
          </div>

          {/* 4. Zoom Status & Reset */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Current Zoom: {Math.round(zoom)}%
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onResetZoom();
                  onResetPan?.();
                }}
                className="h-8 rounded-xl text-xs font-bold"
              >
                Reset View (Center)
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 text-xs font-bold"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
