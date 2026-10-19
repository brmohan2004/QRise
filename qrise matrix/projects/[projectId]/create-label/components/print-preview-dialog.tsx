"use client";

import React, { useRef } from "react";
import { Printer, X, Download, Check, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CanvasElement } from "./element-properties-sheet";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelName: string;
  elements: CanvasElement[];
}

export function PrintPreviewDialog({
  open,
  onOpenChange,
  labelName,
  elements,
}: PrintPreviewDialogProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl max-h-[95vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col"
      >
        <DialogTitle className="sr-only">Print Preview</DialogTitle>
        <DialogDescription className="sr-only">
          Thermal print preview for {labelName}
        </DialogDescription>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Printer className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Thermal Output
                </span>
              </div>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                {labelName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Area Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/80 dark:bg-slate-950 flex flex-col items-center justify-center">
          <div
            ref={printAreaRef}
            id="print-label-sticker"
            style={{ width: "380px", height: "570px" }}
            className="relative bg-white rounded-xl shadow-xl border-2 border-slate-900/10 text-slate-950 overflow-hidden select-none shrink-0"
          >
            {elements.map((elem) => (
              <div
                key={elem.id}
                style={{
                  position: "absolute",
                  left: `${(elem.x / 390) * 380}px`,
                  top: `${(elem.y / 580) * 570}px`,
                  width: elem.width ? `${(elem.width / 390) * 380}px` : "auto",
                  height: elem.height ? `${(elem.height / 580) * 570}px` : "auto",
                }}
                className="overflow-hidden p-1 flex flex-col justify-center"
              >
                {elem.type === "qr" && (
                  <div className="w-full h-full flex items-center justify-center bg-white border border-slate-900 p-1 rounded">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                )}

                {elem.type === "barcode" && (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <svg viewBox="0 0 240 44" className="w-full h-full max-h-12" preserveAspectRatio="none">
                      <rect x="0" y="0" width="3" height="44" fill="#000" />
                      <rect x="6" y="0" width="2" height="44" fill="#000" />
                      <rect x="11" y="0" width="5" height="44" fill="#000" />
                      <rect x="19" y="0" width="2" height="44" fill="#000" />
                      <rect x="24" y="0" width="4" height="44" fill="#000" />
                      <rect x="31" y="0" width="2" height="44" fill="#000" />
                      <rect x="36" y="0" width="6" height="44" fill="#000" />
                      <rect x="45" y="0" width="3" height="44" fill="#000" />
                      <rect x="51" y="0" width="2" height="44" fill="#000" />
                      <rect x="56" y="0" width="5" height="44" fill="#000" />
                      <rect x="64" y="0" width="4" height="44" fill="#000" />
                      <rect x="71" y="0" width="2" height="44" fill="#000" />
                      <rect x="76" y="0" width="6" height="44" fill="#000" />
                      <rect x="85" y="0" width="3" height="44" fill="#000" />
                      <rect x="91" y="0" width="2" height="44" fill="#000" />
                      <rect x="96" y="0" width="4" height="44" fill="#000" />
                      <rect x="103" y="0" width="5" height="44" fill="#000" />
                      <rect x="111" y="0" width="3" height="44" fill="#000" />
                      <rect x="117" y="0" width="2" height="44" fill="#000" />
                      <rect x="122" y="0" width="6" height="44" fill="#000" />
                      <rect x="131" y="0" width="3" height="44" fill="#000" />
                      <rect x="137" y="0" width="5" height="44" fill="#000" />
                      <rect x="145" y="0" width="2" height="44" fill="#000" />
                      <rect x="150" y="0" width="4" height="44" fill="#000" />
                      <rect x="157" y="0" width="3" height="44" fill="#000" />
                      <rect x="163" y="0" width="6" height="44" fill="#000" />
                      <rect x="172" y="0" width="2" height="44" fill="#000" />
                      <rect x="177" y="0" width="4" height="44" fill="#000" />
                      <rect x="184" y="0" width="5" height="44" fill="#000" />
                      <rect x="192" y="0" width="2" height="44" fill="#000" />
                      <rect x="197" y="0" width="6" height="44" fill="#000" />
                      <rect x="206" y="0" width="3" height="44" fill="#000" />
                      <rect x="212" y="0" width="5" height="44" fill="#000" />
                      <rect x="220" y="0" width="2" height="44" fill="#000" />
                      <rect x="225" y="0" width="4" height="44" fill="#000" />
                      <rect x="232" y="0" width="3" height="44" fill="#000" />
                      <rect x="238" y="0" width="2" height="44" fill="#000" />
                    </svg>
                    <span className="font-mono text-[10px] font-black tracking-widest text-black mt-0.5">
                      {elem.content}
                    </span>
                  </div>
                )}

                {elem.type === "line" && (
                  <div className="w-full h-[2px] bg-black my-auto" />
                )}

                {elem.type === "rectangle" && (
                  <div className="w-full h-full border-2 border-black rounded" />
                )}

                {elem.type === "table" && (
                  <div className="w-full h-full border border-black rounded p-1 text-[9px] font-mono font-bold text-black flex items-center justify-between">
                    <span>{elem.content}</span>
                  </div>
                )}

                {elem.type !== "qr" && elem.type !== "barcode" && elem.type !== "line" && elem.type !== "rectangle" && elem.type !== "table" && (
                  <div>
                    <span
                      className={cn(
                        "leading-tight text-black block",
                        elem.fontSize === "3xl" ? "text-2xl font-black" :
                        elem.fontSize === "2xl" ? "text-xl font-black" :
                        elem.fontSize === "xl" ? "text-lg font-black" :
                        elem.fontSize === "lg" ? "text-base font-extrabold" :
                        elem.fontSize === "sm" ? "text-xs font-semibold" :
                        elem.fontSize === "xs" ? "text-[10px] font-medium" : "text-sm font-bold",
                        elem.fontFamily === "mono" ? "font-mono" :
                        elem.fontFamily === "serif" ? "font-serif" : "",
                        elem.align === "center" ? "text-center" :
                        elem.align === "right" ? "text-right" :
                        elem.align === "justify" ? "text-justify" : "text-left",
                        elem.textTransform === "uppercase" ? "uppercase" :
                        elem.textTransform === "capitalize" ? "capitalize" :
                        elem.textTransform === "lowercase" ? "lowercase" : ""
                      )}
                    >
                      {elem.content}
                    </span>
                    {elem.subContent && (
                      <span className="text-[10px] text-gray-700 font-medium whitespace-pre-line leading-tight block mt-0.5">
                        {elem.subContent}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <p className="text-xs text-slate-500 font-medium">
            Standard 4 × 6 in (100 × 150 mm) · 203 DPI
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-9 text-xs font-bold"
            >
              Close
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-4 text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Print Label</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
