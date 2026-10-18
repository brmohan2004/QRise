"use client";

import React from "react";
import { 
  X, 
  Trash2, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Minus,
  Plus,
  Type
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CanvasElement {
  id: string;
  type: string;
  title: string;
  content: string;
  subContent?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  fontWeight?: "normal" | "medium" | "bold" | "black";
  fontFamily?: "sans" | "mono" | "serif" | "display";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  align?: "left" | "center" | "right" | "justify";
  textTransform?: "uppercase" | "capitalize" | "lowercase" | "none";
  letterSpacing?: "tighter" | "normal" | "wider" | "widest";
  lineHeight?: "tight" | "normal" | "relaxed";
  barcodeType?: string;
  isLocked?: boolean;
}

interface ElementPropertiesSheetProps {
  element: CanvasElement | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: CanvasElement) => void;
  onDelete: (id: string) => void;
}

const FONT_FAMILIES = [
  { id: "sans", label: "Calibri / Sans", fontClass: "font-sans" },
  { id: "serif", label: "Times / Serif", fontClass: "font-serif" },
  { id: "mono", label: "Courier / Mono", fontClass: "font-mono" },
  { id: "display", label: "Arial Black", fontClass: "font-black" },
];

const FONT_SIZES: { id: CanvasElement["fontSize"]; pt: number; label: string }[] = [
  { id: "xs", pt: 10, label: "10" },
  { id: "sm", pt: 12, label: "12" },
  { id: "base", pt: 14, label: "14" },
  { id: "lg", pt: 16, label: "16" },
  { id: "xl", pt: 18, label: "18" },
  { id: "2xl", pt: 22, label: "22" },
  { id: "3xl", pt: 26, label: "26" },
];

export function ElementPropertiesSheet({
  element,
  open,
  onClose,
  onUpdate,
  onDelete,
}: ElementPropertiesSheetProps) {
  if (!open || !element) return null;

  const isTextType = ["text", "date", "dynamic", "table"].includes(element.type);

  // MS Word Mobile Style helpers for font size stepper
  const currentSizeIndex = Math.max(
    0,
    FONT_SIZES.findIndex((s) => s.id === (element.fontSize || "base"))
  );

  const handleStepFontSize = (delta: number) => {
    const nextIndex = Math.min(Math.max(currentSizeIndex + delta, 0), FONT_SIZES.length - 1);
    onUpdate({ ...element, fontSize: FONT_SIZES[nextIndex].id });
  };

  const isBold = element.fontWeight === "bold" || element.fontWeight === "black";
  const isItalic = element.fontStyle === "italic";
  const isUnderline = element.textDecoration === "underline";

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-[2px] z-40 transition-opacity" 
      />

      {/* Drawer: Exactly 40% screen height on mobile screen (h-[40vh] max-h-[40vh]), comfortable on desktop */}
      <div className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 max-w-lg w-full bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 p-4 sm:p-5 flex flex-col h-[40vh] max-h-[40vh] sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-bottom-4 duration-200">
        {/* Mobile Pull Handle */}
        <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto -mt-1 mb-2 cursor-grab shrink-0" />

        {/* MS Word Mobile Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
              <Type className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {element.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDelete(element.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Element"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body (fits within 40vh on mobile) */}
        <div className="flex-1 overflow-y-auto pt-2 space-y-3 pr-1 scrollbar-thin">
          {/* 1. Content Text Line */}
          <div>
            <Input
              value={element.content}
              onChange={(e) => onUpdate({ ...element, content: e.target.value })}
              placeholder="Edit text content..."
              className="h-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold"
            />
          </div>

          {/* 2. MS Word Mobile Formatting Ribbon (Font Family + Font Size Stepper) */}
          {isTextType && (
            <div className="space-y-2">
              {/* Row 1: Font Family Dropdown + Font Size Stepper */}
              <div className="flex items-center gap-2">
                {/* Font Family Selector */}
                <select
                  value={element.fontFamily || "sans"}
                  onChange={(e) => onUpdate({ ...element, fontFamily: e.target.value as any })}
                  className="flex-1 h-9 rounded-xl px-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </select>

                {/* Font Size Stepper (- [Size] +) */}
                <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-9 px-1">
                  <button
                    type="button"
                    onClick={() => handleStepFontSize(-1)}
                    disabled={currentSizeIndex === 0}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                    title="Decrease Font Size"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    {FONT_SIZES[currentSizeIndex]?.label || "14"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStepFontSize(1)}
                    disabled={currentSizeIndex === FONT_SIZES.length - 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                    title="Increase Font Size"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 2: B / I / U Ribbon + Alignment Ribbon */}
              <div className="flex items-center justify-between gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {/* B / I / U */}
                <div className="flex items-center gap-1">
                  {/* Bold */}
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate({
                        ...element,
                        fontWeight: isBold ? "normal" : "bold",
                      })
                    }
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      isBold
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    )}
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {/* Italic */}
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate({
                        ...element,
                        fontStyle: isItalic ? "normal" : "italic",
                      })
                    }
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      isItalic
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    )}
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {/* Underline */}
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate({
                        ...element,
                        textDecoration: isUnderline ? "none" : "underline",
                      })
                    }
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      isUnderline
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    )}
                    title="Underline"
                  >
                    <UnderlineIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" />

                {/* Alignment */}
                <div className="flex items-center gap-1">
                  {[
                    { id: "left", icon: AlignLeft, title: "Align Left" },
                    { id: "center", icon: AlignCenter, title: "Center" },
                    { id: "right", icon: AlignRight, title: "Align Right" },
                    { id: "justify", icon: AlignJustify, title: "Justify" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = element.align === item.id || (!element.align && item.id === "left");
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onUpdate({ ...element, align: item.id as any })}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          isActive
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                        )}
                        title={item.title}
                      >
                        <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Barcode specific symbology */}
          {element.type === "barcode" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">Symbology</label>
              <div className="flex gap-1.5 flex-wrap">
                {["Code 128", "EAN-13", "UPC-A", "GS1-128"].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => onUpdate({ ...element, barcodeType: sym })}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border",
                      element.barcodeType === sym
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    )}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Done / Close footer */}
        <div className="pt-2 shrink-0">
          <Button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-8 sm:h-9 font-bold text-xs shadow-sm shadow-emerald-600/30"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  );
}
