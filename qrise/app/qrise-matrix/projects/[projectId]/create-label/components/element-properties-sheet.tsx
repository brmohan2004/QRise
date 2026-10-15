"use client";

import React from "react";
import { X, Trash2, Sliders, Type, Barcode, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface CanvasElement {
  id: string;
  type: string;
  title: string;
  content: string;
  subContent?: string;
  fontSize?: "sm" | "base" | "lg" | "xl";
  barcodeType?: string;
  align?: "left" | "center" | "right";
}

interface ElementPropertiesSheetProps {
  element: CanvasElement | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: CanvasElement) => void;
  onDelete: (id: string) => void;
}

export function ElementPropertiesSheet({
  element,
  open,
  onClose,
  onUpdate,
  onDelete,
}: ElementPropertiesSheetProps) {
  if (!open || !element) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs z-40 transition-opacity" 
      />

      {/* Properties Drawer */}
      <div className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 max-w-lg w-full bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 p-5 sm:p-6 pb-8 space-y-4 animate-in slide-in-from-bottom-6 duration-200">
        <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto -mt-1 cursor-grab" />

        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider">
              {element.title} Properties
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onDelete(element.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Element"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Field */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Value / Content
            </label>
            <Input
              value={element.content}
              onChange={(e) => onUpdate({ ...element, content: e.target.value })}
              className="h-10 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          {element.subContent !== undefined && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Secondary Text / Address
              </label>
              <Textarea
                value={element.subContent}
                onChange={(e) => onUpdate({ ...element, subContent: e.target.value })}
                className="min-h-[70px] rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none"
              />
            </div>
          )}

          {/* Barcode Symbology Selector if element is barcode */}
          {element.type === "barcode" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Barcode Symbology
              </label>
              <div className="flex gap-2 flex-wrap">
                {["Code 128", "EAN-13", "UPC-A", "GS1-128"].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => onUpdate({ ...element, barcodeType: sym })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                      element.barcodeType === sym
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-bold text-xs"
          >
            Done Editing
          </Button>
        </div>
      </div>
    </>
  );
}
