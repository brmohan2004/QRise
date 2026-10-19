"use client";

import React from "react";
import { Square, Minus, Circle, Box, LayoutGrid, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export type ShapeType = "rectangle" | "line" | "circle" | "box" | "divider";

interface ShapesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectShape: (shape: ShapeType) => void;
}

const SHAPES: { type: ShapeType; title: string; desc: string; icon: React.ElementType }[] = [
  { type: "rectangle", title: "Rectangle Box", desc: "Outlined container for shipping notes", icon: Square },
  { type: "line", title: "Horizontal Line", desc: "Clean 2px divider between sections", icon: Minus },
  { type: "circle", title: "Circular Badge", desc: "Round label stamp or priority indicator", icon: Circle },
  { type: "box", title: "Dashed Safe Box", desc: "Dashed border inspection or barcode zone", icon: Box },
];

export function ShapesDialog({ open, onOpenChange, onSelectShape }: ShapesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col"
      >
        <DialogTitle className="sr-only">Add Shape</DialogTitle>
        <DialogDescription className="sr-only">Choose a geometric shape or line to add to the label</DialogDescription>

        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Square className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                Add Shape & Dividers
              </h2>
              <p className="text-xs text-slate-500 font-medium">Select a shape to place on the label</p>
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

        <div className="p-4 grid grid-cols-2 gap-3">
          {SHAPES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  onSelectShape(item.type);
                  onOpenChange(false);
                }}
                className="flex flex-col items-start gap-2.5 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-emerald-50/40 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all text-left group active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
