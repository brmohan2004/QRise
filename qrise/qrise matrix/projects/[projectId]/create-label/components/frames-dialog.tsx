"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Receipt, 
  Trash2, 
  Plus, 
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface LabelFramePreset {
  id: string;
  name: string;
  subTitle: string;
  width: number;
  height: number;
  inches: string;
  category?: "billing" | "custom";
}

// Minimal, clean standard shapes for billing/invoicing & POS receipts
export const BILLING_FRAMES: LabelFramePreset[] = [
  {
    id: "frame-billing-4x6",
    name: "4 × 6\" Invoice / Shipping Slip",
    subTitle: "Standard commercial invoice with customs barcode",
    width: 390,
    height: 580,
    inches: "4.0\" × 6.0\"",
    category: "billing",
  },
  {
    id: "frame-billing-80mm",
    name: "3.15\" (80mm) POS Thermal Receipt",
    subTitle: "Retail POS bill, itemized order checkout",
    width: 340,
    height: 480,
    inches: "3.15\" × 5.0\"",
    category: "billing",
  },
  {
    id: "frame-billing-58mm",
    name: "2.28\" (58mm) Mini POS Receipt",
    subTitle: "Handheld bill printer & card machine slip",
    width: 280,
    height: 380,
    inches: "2.28\" × 4.0\"",
    category: "billing",
  },
  {
    id: "frame-billing-itemtag",
    name: "3 × 2\" Price & Barcode Tag",
    subTitle: "Shelf edge price tag, item SKU with tax details",
    width: 360,
    height: 240,
    inches: "3.0\" × 2.0\"",
    category: "billing",
  },
  {
    id: "frame-billing-square",
    name: "4 × 4\" Delivery Packing Slip",
    subTitle: "Carton bill manifest, invoice dispatch label",
    width: 390,
    height: 390,
    inches: "4.0\" × 4.0\"",
    category: "billing",
  },
];

export const INITIAL_FRAMES: LabelFramePreset[] = [...BILLING_FRAMES];
export const LABEL_FRAMES = BILLING_FRAMES;

interface FramesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeFrame: LabelFramePreset | null;
  onSelectFrame: (frame: LabelFramePreset) => void;
  onDeleteFrame: () => void;
}

export function FramesDialog({
  open,
  onOpenChange,
  activeFrame,
  onSelectFrame,
  onDeleteFrame,
}: FramesDialogProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<"standard" | "custom">("standard");

  // Custom dimensions state
  const [customWidth, setCustomWidth] = useState<number>(390);
  const [customHeight, setCustomHeight] = useState<number>(500);
  const [customUnit, setCustomUnit] = useState<"px" | "in">("px");
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle creating custom frame
  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    let widthPx = customWidth;
    let heightPx = customHeight;

    if (customUnit === "in") {
      // Convert inches to approx canvas pixels (assuming ~96dpi scale: 1 inch ≈ 96px)
      widthPx = Math.round(customWidth * 96);
      heightPx = Math.round(customHeight * 96);
    }

    widthPx = Math.max(150, Math.min(widthPx, 800));
    heightPx = Math.max(120, Math.min(heightPx, 1000));

    const inchesStr = customUnit === "in" 
      ? `${customWidth.toFixed(1)}" × ${customHeight.toFixed(1)}"`
      : `${(widthPx / 96).toFixed(1)}" × ${(heightPx / 96).toFixed(1)}"`;

    const newFrame: LabelFramePreset = {
      id: `frame-custom-${Date.now()}`,
      name: customName.trim() || `Custom (${widthPx}×${heightPx}px)`,
      subTitle: `User custom size: ${inchesStr}`,
      width: widthPx,
      height: heightPx,
      inches: inchesStr,
      category: "custom",
    };

    onSelectFrame(newFrame);
    onOpenChange(false);
  };

  const Content = () => (
    <div className="space-y-4">
      {/* Minimal Tabs: Standard Billing vs Custom Size */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("standard")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg transition-all text-xs font-bold flex items-center justify-center gap-1.5",
            activeTab === "standard"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Receipt className="w-3.5 h-3.5" />
          Standard Billing
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg transition-all text-xs font-bold flex items-center justify-center gap-1.5",
            activeTab === "custom"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Custom Size
        </button>
      </div>

      {activeTab === "standard" ? (
        /* Minimal List of Standard Billing Shapes */
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {BILLING_FRAMES.map((frame) => {
            const isSelected = activeFrame?.id === frame.id;
            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => {
                  onSelectFrame(frame);
                  onOpenChange(false);
                }}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all active:scale-[0.99] flex items-center justify-between gap-3",
                  isSelected
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-white"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {frame.name}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shrink-0">
                      {frame.inches}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {frame.subTitle}
                  </p>
                </div>

                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {frame.width}×{frame.height}px
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Minimal Form: User enters custom width & length */
        <form onSubmit={handleCreateCustom} className="space-y-3.5 p-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Label Title / Note (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., Warehouse Dispatch Slip"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="h-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Unit Toggle: Pixels vs Inches */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Measurement Unit
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (customUnit === "in") {
                    setCustomWidth(Math.round(customWidth * 96));
                    setCustomHeight(Math.round(customHeight * 96));
                  }
                  setCustomUnit("px");
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md font-bold transition-all",
                  customUnit === "px"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                Pixels (px)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customUnit === "px") {
                    setCustomWidth(Number((customWidth / 96).toFixed(2)));
                    setCustomHeight(Number((customHeight / 96).toFixed(2)));
                  }
                  setCustomUnit("in");
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md font-bold transition-all",
                  customUnit === "in"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                Inches (in)
              </button>
            </div>
          </div>

          {/* Width & Height Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Width ({customUnit})
              </span>
              <Input
                type="number"
                step={customUnit === "in" ? "0.1" : "1"}
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="h-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Height / Length ({customUnit})
              </span>
              <Input
                type="number"
                step={customUnit === "in" ? "0.1" : "1"}
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                className="h-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono font-bold"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Apply Custom Frame
          </Button>
        </form>
      )}

      {/* Delete / Remove Frame Action */}
      {activeFrame && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">
            Active: <strong className="text-slate-800 dark:text-slate-200">{activeFrame.name}</strong>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onDeleteFrame();
              onOpenChange(false);
            }}
            className="h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Frame
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-[28px] p-4 pb-7 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left px-0 pt-0 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Billing Frames & Dimensions
                </SheetTitle>
                <SheetDescription className="text-[11px] text-slate-500">
                  Select standard billing receipt shape or create custom
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Content />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <DialogHeader className="pb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Billing Frames & Dimensions
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Select standard billing receipt shape or create custom
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Content />
      </DialogContent>
    </Dialog>
  );
}
