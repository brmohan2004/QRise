"use client";

import React, { useState } from "react";
import { 
  Undo2, 
  Redo2, 
  Maximize2, 
  Plus, 
  QrCode, 
  Barcode as BarcodeIcon 
} from "lucide-react";
import { CanvasElement } from "./element-properties-sheet";
import { cn } from "@/lib/utils";

interface LabelCanvasProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (element: CanvasElement) => void;
  onOpenAddSheet: () => void;
}

export function LabelCanvas({
  elements,
  selectedElementId,
  onSelectElement,
  onOpenAddSheet,
}: LabelCanvasProps) {
  // Find key elements from state
  const headerElem = elements.find((e) => e.id === "elem-header");
  const idElem = elements.find((e) => e.id === "elem-id");
  const fromElem = elements.find((e) => e.id === "elem-from");
  const toElem = elements.find((e) => e.id === "elem-to");
  const barcodeElem = elements.find((e) => e.id === "elem-barcode");
  const qrElem = elements.find((e) => e.id === "elem-qr");

  // Custom dynamically added elements
  const customElements = elements.filter(
    (e) => !["elem-header", "elem-id", "elem-from", "elem-to", "elem-barcode", "elem-qr"].includes(e.id)
  );

  return (
    <div className="relative w-full rounded-3xl border-2 border-dashed border-indigo-200/70 dark:border-indigo-900/50 bg-slate-50/40 dark:bg-slate-950/20 p-4 sm:p-8 min-h-[500px] flex items-center justify-center select-none overflow-hidden">
      {/* Centered Printable Sticker Card */}
      <div className="w-full max-w-[340px] sm:max-w-[360px] bg-white rounded-2xl p-5 shadow-xl border border-slate-200/90 text-slate-950 space-y-3.5 transition-all">
        {/* Top Header Row: Company Title + QR Code */}
        <div className="flex items-start justify-between gap-3">
          <div
            onClick={() => headerElem && onSelectElement(headerElem)}
            className={cn(
              "p-1.5 rounded-lg cursor-pointer transition-all hover:bg-slate-50 min-w-0 flex-1",
              selectedElementId === "elem-header" && "ring-2 ring-emerald-500 bg-emerald-50/30"
            )}
          >
            <h2 className="text-base font-black tracking-tight text-slate-900 leading-none">
              {headerElem?.content || "ABC LOGISTICS"}
            </h2>
            <p className="text-[10px] text-slate-500 font-medium mt-1 leading-none">
              {headerElem?.subContent || "Fast · Secure · Worldwide"}
            </p>
          </div>

          <div
            onClick={() => qrElem && onSelectElement(qrElem)}
            className={cn(
              "p-1.5 rounded-lg cursor-pointer transition-all hover:bg-slate-50 shrink-0",
              selectedElementId === "elem-qr" && "ring-2 ring-emerald-500 bg-emerald-50/30"
            )}
          >
            <div className="w-14 h-14 bg-white border border-slate-900/80 p-1 flex items-center justify-center rounded-md">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
          </div>
        </div>

        {/* Shipment ID Row */}
        <div
          onClick={() => idElem && onSelectElement(idElem)}
          className={cn(
            "p-1.5 rounded-lg cursor-pointer transition-all hover:bg-slate-50",
            selectedElementId === "elem-id" && "ring-2 ring-emerald-500 bg-emerald-50/30"
          )}
        >
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
            SHIPMENT ID
          </span>
          <p className="text-lg font-black text-slate-950 leading-tight">
            {idElem?.content || "CR-10025"}
          </p>
        </div>

        {/* Horizontal Divider */}
        <div className="h-px bg-slate-200 w-full" />

        {/* Two-Column Address Block (FROM & TO) */}
        <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
          {/* FROM */}
          <div
            onClick={() => fromElem && onSelectElement(fromElem)}
            className={cn(
              "p-1.5 rounded-lg cursor-pointer transition-all hover:bg-slate-50",
              selectedElementId === "elem-from" && "ring-2 ring-emerald-500 bg-emerald-50/30"
            )}
          >
            <span className="font-black text-slate-900 uppercase tracking-wider block">
              FROM
            </span>
            <p className="text-slate-600 whitespace-pre-line mt-0.5 font-medium">
              {fromElem?.content || "Chennai Warehouse\n123 Industrial Area\nChennai, Tamil Nadu\n600001"}
            </p>
          </div>

          {/* TO */}
          <div
            onClick={() => toElem && onSelectElement(toElem)}
            className={cn(
              "p-1.5 rounded-lg cursor-pointer transition-all hover:bg-slate-50",
              selectedElementId === "elem-to" && "ring-2 ring-emerald-500 bg-emerald-50/30"
            )}
          >
            <span className="font-black text-slate-900 uppercase tracking-wider block">
              TO
            </span>
            <p className="text-slate-600 whitespace-pre-line mt-0.5 font-medium">
              {toElem?.content || "John Doe\n456, MG Road\nBengaluru, Karnataka\n560001"}
            </p>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="h-px bg-slate-200 w-full" />

        {/* Barcode Section */}
        <div
          onClick={() => barcodeElem && onSelectElement(barcodeElem)}
          className={cn(
            "p-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50 flex flex-col items-center justify-center",
            selectedElementId === "elem-barcode" && "ring-2 ring-emerald-500 bg-emerald-50/30"
          )}
        >
          {/* High Fidelity Barcode Representation */}
          <div className="w-full h-12 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 240 48" className="w-full h-full" preserveAspectRatio="none">
              {/* Barcode Lines */}
              <rect x="0" y="0" width="3" height="48" fill="#0f172a" />
              <rect x="6" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="11" y="0" width="5" height="48" fill="#0f172a" />
              <rect x="19" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="24" y="0" width="4" height="48" fill="#0f172a" />
              <rect x="31" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="36" y="0" width="6" height="48" fill="#0f172a" />
              <rect x="45" y="0" width="3" height="48" fill="#0f172a" />
              <rect x="51" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="56" y="0" width="5" height="48" fill="#0f172a" />
              <rect x="64" y="0" width="4" height="48" fill="#0f172a" />
              <rect x="71" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="76" y="0" width="6" height="48" fill="#0f172a" />
              <rect x="85" y="0" width="3" height="48" fill="#0f172a" />
              <rect x="91" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="96" y="0" width="4" height="48" fill="#0f172a" />
              <rect x="103" y="0" width="5" height="48" fill="#0f172a" />
              <rect x="111" y="0" width="3" height="48" fill="#0f172a" />
              <rect x="117" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="122" y="0" width="6" height="48" fill="#0f172a" />
              <rect x="131" y="0" width="3" height="48" fill="#0f172a" />
              <rect x="137" y="0" width="5" height="48" fill="#0f172a" />
              <rect x="145" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="150" y="0" width="4" height="48" fill="#0f172a" />
              <rect x="157" y="0" width="3" height="48" fill="#0f172a" />
              <rect x="163" y="0" width="6" height="48" fill="#0f172a" />
              <rect x="172" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="177" y="0" width="4" height="48" fill="#0f172a" />
              <rect x="184" y="0" width="5" height="48" fill="#0f172a" />
              <rect x="192" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="197" y="0" width="6" height="48" fill="#0f172a" />
              <rect x="206" y="0" width="3" height="48" fill="#0f172a" />
              <rect x="212" y="0" width="5" height="48" fill="#0f172a" />
              <rect x="220" y="0" width="2" height="48" fill="#0f172a" />
              <rect x="225" y="0" width="4" height="48" fill="#0f172a" />
              <rect x="232" y="0" width="3" height="48" fill="#0f172a" />
              <rect x="238" y="0" width="2" height="48" fill="#0f172a" />
            </svg>
          </div>
          <span className="font-mono text-xs font-black tracking-wider text-slate-900 mt-1">
            {barcodeElem?.content || "CR-10025"}
          </span>
        </div>

        {/* Dynamically Added Elements */}
        {customElements.map((elem) => (
          <div
            key={elem.id}
            onClick={() => onSelectElement(elem)}
            className={cn(
              "p-2 rounded-lg cursor-pointer transition-all border border-dashed border-slate-300 hover:bg-slate-50 flex items-center justify-between",
              selectedElementId === elem.id && "ring-2 ring-emerald-500 bg-emerald-50/30 border-emerald-400"
            )}
          >
            <span className="text-xs font-bold text-slate-800">{elem.content}</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold">
              {elem.type}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Action Toolbar on Bottom Right */}
      <div className="absolute right-4 sm:right-6 bottom-4 sm:bottom-6 flex items-center gap-2">
        <button
          type="button"
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all active:scale-95"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all active:scale-95"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all active:scale-95"
          title="Fullscreen Canvas"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Elevated Circular Green + Button (Triggers Add Element Sheet) */}
        <button
          type="button"
          onClick={onOpenAddSheet}
          className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all active:scale-90 hover:scale-105 ml-1"
          title="Add Element"
          aria-label="Add Element"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
