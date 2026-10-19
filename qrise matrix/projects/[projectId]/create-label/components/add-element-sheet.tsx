"use client";

import React from "react";
import { 
  Type, 
  Barcode, 
  QrCode, 
  Image as ImageIcon, 
  Square, 
  Minus, 
  Star, 
  Calendar, 
  Braces, 
  Table as TableIcon,
  Plus,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ElementType = 
  | "text" 
  | "barcode" 
  | "qr" 
  | "image" 
  | "rectangle" 
  | "line" 
  | "icon" 
  | "date" 
  | "dynamic" 
  | "table";

interface AddElementSheetProps {
  open: boolean;
  onClose: () => void;
  onAddElement: (type: ElementType) => void;
}

const ELEMENT_ITEMS: {
  type: ElementType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "barcode", label: "Barcode", icon: Barcode },
  { type: "qr", label: "QR Code", icon: QrCode },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "rectangle", label: "Rectangle", icon: Square },
  { type: "line", label: "Line", icon: Minus },
  { type: "icon", label: "Icon", icon: Star },
  { type: "date", label: "Date", icon: Calendar },
  { type: "dynamic", label: "Dynamic Text", icon: Braces },
  { type: "table", label: "Table", icon: TableIcon },
];

export function AddElementSheet({ open, onClose, onAddElement }: AddElementSheetProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity duration-200" 
      />

      {/* Slide-Up Bottom Sheet */}
      <div className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 max-w-lg w-full bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 p-5 sm:p-6 pb-8 space-y-4 animate-in slide-in-from-bottom-8 duration-300">
        {/* Grab Handle Pill */}
        <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto -mt-1 cursor-grab" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/60 dark:border-emerald-800/60">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wider text-slate-900 dark:text-white uppercase font-mono">
                ADD ELEMENT
              </h2>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5">
                DRAG OR TAP TO ADD
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Element Grid */}
        <div className="grid grid-cols-2 gap-2.5 max-h-[55vh] overflow-y-auto no-scrollbar pt-1">
          {ELEMENT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  onAddElement(item.type);
                  onClose();
                }}
                className="group flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 hover:shadow-sm transition-all text-left active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
