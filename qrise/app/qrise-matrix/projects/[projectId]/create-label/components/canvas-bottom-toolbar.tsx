"use client";

import React from "react";
import { 
  MousePointer, 
  Frame,
  Plus, 
  Square, 
  Eye, 
  Sliders 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomToolType = "select" | "frames" | "add" | "shapes" | "preview";

interface CanvasBottomToolbarProps {
  activeTool: BottomToolType;
  onSelectTool: (tool: BottomToolType) => void;
  onOpenFrames: () => void;
  onOpenAdd: () => void;
  onOpenShapes: () => void;
  onOpenPreview: () => void;
  hasSelectedElement: boolean;
  onOpenProperties: () => void;
}

export function CanvasBottomToolbar({
  activeTool,
  onSelectTool,
  onOpenFrames,
  onOpenAdd,
  onOpenShapes,
  onOpenPreview,
  hasSelectedElement,
  onOpenProperties,
}: CanvasBottomToolbarProps) {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 select-none">
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800/90 backdrop-blur-md shadow-2xl shadow-slate-950/20">
        {/* 1. Selector Tool (Icon only) */}
        <button
          type="button"
          onClick={() => onSelectTool("select")}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
            activeTool === "select"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          title="Select & Move Tool"
          aria-label="Select Tool"
        >
          <MousePointer className="w-4 h-4 stroke-[2.2]" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 my-auto" />

        {/* 2. Frames Tool (Icon only) */}
        <button
          type="button"
          onClick={() => {
            onSelectTool("frames");
            onOpenFrames();
          }}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
            activeTool === "frames"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          title="Label Frames & Sizes"
          aria-label="Frames"
        >
          <Frame className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* 3. Add Tool (Icon only) */}
        <button
          type="button"
          onClick={() => {
            onSelectTool("add");
            onOpenAdd();
          }}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
            activeTool === "add"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          title="Add Element (Text, Barcode, QR Code)"
          aria-label="Add Element"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* 4. Shapes Tool (Icon only) */}
        <button
          type="button"
          onClick={() => {
            onSelectTool("shapes");
            onOpenShapes();
          }}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
            activeTool === "shapes"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
          title="Shapes & Lines"
          aria-label="Shapes"
        >
          <Square className="w-4 h-4 stroke-[2.2]" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 my-auto" />

        {/* 5. Preview Tool (Icon only) */}
        <button
          type="button"
          onClick={() => {
            onSelectTool("preview");
            onOpenPreview();
          }}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
            activeTool === "preview"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
              : "text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400"
          )}
          title="Print & Thermal Preview"
          aria-label="Preview"
        >
          <Eye className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Contextual Properties Quick Trigger (Icon only) */}
        {hasSelectedElement && (
          <>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 my-auto" />
            <button
              type="button"
              onClick={onOpenProperties}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-all active:scale-95 animate-in fade-in"
              title="Edit Element Properties"
              aria-label="Edit Properties"
            >
              <Sliders className="w-4 h-4 stroke-[2.2]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
