"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { cn } from "@/lib/utils";
import type { QRShapeType } from "@/types/qr.types";
import { Lock, Unlock, RotateCcw, Sliders, MoveHorizontal, MoveVertical } from "lucide-react";

interface ShapeItem {
  id: QRShapeType;
  label: string;
  description: string;
  category: "standard" | "matrix" | "specialty";
  width: number;
  height: number;
  icon: React.ReactNode;
}

const SHAPES: ShapeItem[] = [
  // Standard QR Formats
  {
    id: "square",
    label: "QR Code",
    description: "Classic ISO square QR code",
    category: "standard",
    width: 300,
    height: 300,
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="7" y="7" width="8" height="8" rx="1" fill="currentColor" />
        <rect x="30" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="33" y="7" width="8" height="8" rx="1" fill="currentColor" />
        <rect x="4" y="30" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="7" y="33" width="8" height="8" rx="1" fill="currentColor" />
        <rect x="21" y="5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="25" y="9" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="21" y="13" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="21" y="21" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="29" y="21" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="21" y="29" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="33" y="37" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "micro",
    label: "Micro QR",
    description: "Compact single-finder QR",
    category: "standard",
    width: 200,
    height: 200,
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="8" y="8" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="12" y="12" width="8" height="8" rx="1" fill="currentColor" />
        <rect x="28" y="9" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="34" y="9" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="28" y="15" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="9" y="28" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="15" y="28" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="28" y="28" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="34" y="34" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "rectangular",
    label: "Rectangular",
    description: "Wide format rMQR ISO code",
    category: "standard",
    width: 340,
    height: 170,
    icon: (
      <svg viewBox="0 0 72 36" className="w-full h-full" fill="none">
        <rect x="3" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="6" y="8" width="8" height="8" rx="1" fill="currentColor" />
        <rect x="57" y="5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="60" y="8" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="20" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="26" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="38" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="50" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="20" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="38" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="50" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },

  // Matrix Codes
  {
    id: "datamatrix",
    label: "Data Matrix",
    description: "ISO L-track industrial matrix",
    category: "matrix",
    width: 280,
    height: 280,
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="6" y="6" width="3" height="36" fill="currentColor" />
        <rect x="6" y="39" width="36" height="3" fill="currentColor" />
        <rect x="12" y="6" width="3" height="3" fill="currentColor" />
        <rect x="18" y="6" width="3" height="3" fill="currentColor" />
        <rect x="24" y="6" width="3" height="3" fill="currentColor" />
        <rect x="30" y="6" width="3" height="3" fill="currentColor" />
        <rect x="36" y="6" width="3" height="3" fill="currentColor" />
        <rect x="39" y="12" width="3" height="3" fill="currentColor" />
        <rect x="39" y="18" width="3" height="3" fill="currentColor" />
        <rect x="39" y="24" width="3" height="3" fill="currentColor" />
        <rect x="39" y="30" width="3" height="3" fill="currentColor" />
        <rect x="39" y="36" width="3" height="3" fill="currentColor" />
        <rect x="12" y="12" width="3" height="3" fill="currentColor" opacity="0.7" />
        <rect x="18" y="15" width="3" height="3" fill="currentColor" opacity="0.7" />
        <rect x="24" y="12" width="3" height="3" fill="currentColor" opacity="0.7" />
        <rect x="30" y="18" width="3" height="3" fill="currentColor" opacity="0.7" />
        <rect x="15" y="21" width="3" height="3" fill="currentColor" opacity="0.7" />
        <rect x="21" y="24" width="3" height="3" fill="currentColor" opacity="0.7" />
        <rect x="27" y="21" width="3" height="3" fill="currentColor" opacity="0.7" />
        <rect x="12" y="30" width="3" height="3" fill="currentColor" opacity="0.7" />
        <rect x="24" y="33" width="3" height="3" fill="currentColor" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "aztec",
    label: "Aztec",
    description: "Concentric bullseye target code",
    category: "matrix",
    width: 280,
    height: 280,
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="18" y="18" width="12" height="12" stroke="currentColor" strokeWidth="2.5" />
        <rect x="22" y="22" width="4" height="4" fill="currentColor" />
        <rect x="11" y="11" width="26" height="26" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
        <rect x="5" y="5" width="38" height="38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <rect x="13" y="6" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="29" y="6" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="6" y="21" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="39" y="21" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="13" y="39" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="29" y="39" width="3" height="3" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },

  // Specialty
  {
    id: "trillcode",
    label: "Trillcode",
    description: "Lark Computer 3-border mark",
    category: "specialty",
    width: 280,
    height: 280,
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        <rect x="6" y="6" width="36" height="2.5" fill="currentColor" />
        <rect x="39.5" y="6" width="2.5" height="36" fill="currentColor" />
        <rect x="6" y="6" width="2.5" height="26" fill="currentColor" />
        <rect x="18" y="39.5" width="3" height="2.5" fill="currentColor" />
        <rect x="24" y="39.5" width="3" height="2.5" fill="currentColor" />
        <rect x="30" y="39.5" width="3" height="2.5" fill="currentColor" />
        <rect x="36" y="39.5" width="3" height="2.5" fill="currentColor" />
        <circle cx="11" cy="38" r="4.5" stroke="currentColor" strokeWidth="1.2" />
        <line x1="6.5" y1="38" x2="15.5" y2="38" stroke="currentColor" strokeWidth="0.8" />
        <rect x="14" y="13" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="20" y="13" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="28" y="13" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="14" y="20" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="24" y="20" width="3" height="3" fill="currentColor" opacity="0.6" />
        <rect x="32" y="20" width="3" height="3" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
];

type CategoryFilter = "all" | "standard" | "matrix" | "specialty";

export function SizeSelector() {
  const { design, setDesign } = useWizardStore();
  const currentShape = design.shape || "square";
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);

  const currentShapeObj = SHAPES.find((s) => s.id === currentShape) || SHAPES[0];

  const currentWidth = design.width || currentShapeObj.width;
  const currentHeight = design.height || currentShapeObj.height;

  const shapeAspect = currentShapeObj.width / currentShapeObj.height;

  const filteredShapes = activeCategory === "all"
    ? SHAPES
    : SHAPES.filter((s) => s.category === activeCategory);

  const handleSelect = (shape: ShapeItem) => {
    setDesign({
      shape: shape.id,
      width: shape.width,
      height: shape.height,
    });
  };

  const handleWidthChange = (val: number) => {
    const w = Math.max(80, Math.min(800, val));
    if (aspectRatioLocked) {
      const h = Math.round(w / shapeAspect);
      setDesign({ width: w, height: h });
    } else {
      setDesign({ width: w });
    }
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(80, Math.min(800, val));
    if (aspectRatioLocked) {
      const w = Math.round(h * shapeAspect);
      setDesign({ width: w, height: h });
    } else {
      setDesign({ height: h });
    }
  };

  const handleResetDimensions = () => {
    setDesign({
      width: currentShapeObj.width,
      height: currentShapeObj.height,
    });
  };

  // Shape-specific dimension presets
  const getPresets = (): { label: string; w: number; h: number }[] => {
    if (currentShape === "rectangular") {
      return [
        { label: "280 × 140", w: 280, h: 140 },
        { label: "340 × 170", w: 340, h: 170 },
        { label: "420 × 210", w: 420, h: 210 },
        { label: "500 × 250", w: 500, h: 250 },
      ];
    }
    return [
      { label: "200 × 200", w: 200, h: 200 },
      { label: "280 × 280", w: 280, h: 280 },
      { label: "350 × 350", w: 350, h: 350 },
      { label: "450 × 450", w: 450, h: 450 },
    ];
  };

  const isDefaultSize =
    currentWidth === currentShapeObj.width && currentHeight === currentShapeObj.height;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 block">
            QR & 2D Code Shape
          </label>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
            6 Styles
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 dark:bg-slate-800/80 rounded-xl overflow-x-auto text-[11px] font-medium">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "px-2.5 py-1 rounded-lg transition-all shrink-0",
            activeCategory === "all"
              ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs font-bold"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          All (6)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("standard")}
          className={cn(
            "px-2.5 py-1 rounded-lg transition-all shrink-0",
            activeCategory === "standard"
              ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs font-bold"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          Standard QR (3)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("matrix")}
          className={cn(
            "px-2.5 py-1 rounded-lg transition-all shrink-0",
            activeCategory === "matrix"
              ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs font-bold"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          Matrix (2)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("specialty")}
          className={cn(
            "px-2.5 py-1 rounded-lg transition-all shrink-0",
            activeCategory === "specialty"
              ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs font-bold"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          Specialty (1)
        </button>
      </div>

      {/* Shapes Grid */}
      <div className="grid grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
        {filteredShapes.map((shape) => {
          const isSelected = currentShape === shape.id;
          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => handleSelect(shape)}
              className={cn(
                "group relative flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all duration-200 text-center min-h-[96px]",
                isSelected
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-sm shadow-emerald-100 dark:shadow-none"
                  : "border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50/70 dark:hover:bg-slate-800/40 text-gray-500 dark:text-gray-400"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 mb-1.5 transition-transform duration-200 group-hover:scale-110 shrink-0",
                  isSelected
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 dark:text-gray-500"
                )}
              >
                {shape.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider leading-tight line-clamp-1">
                {shape.label}
              </span>
              <span
                className={cn(
                  "text-[8.5px] mt-0.5 leading-tight line-clamp-1",
                  isSelected
                    ? "text-emerald-600/90 dark:text-emerald-400/90"
                    : "text-gray-400 dark:text-gray-500"
                )}
              >
                {shape.description}
              </span>

              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Manual Size & Dimensions Controller */}
      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Custom Dimensions (Length & Width)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
              title={aspectRatioLocked ? "Aspect ratio locked" : "Aspect ratio unlocked"}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all",
                aspectRatioLocked
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600"
              )}
            >
              {aspectRatioLocked ? (
                <>
                  <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Linked</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-gray-500" />
                  <span>Free</span>
                </>
              )}
            </button>

            {!isDefaultSize && (
              <button
                type="button"
                onClick={handleResetDimensions}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
                title="Reset to default size"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Width & Height Sliders + Inputs */}
        <div className="space-y-3">
          {/* Width / Length */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <MoveHorizontal className="w-3.5 h-3.5 text-gray-400" /> Width / Length
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-0.5 shadow-2xs">
                <input
                  type="number"
                  min={80}
                  max={800}
                  step={10}
                  value={currentWidth}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-12 text-right text-xs font-bold text-gray-900 dark:text-gray-100 bg-transparent focus:outline-hidden"
                />
                <span className="text-[10px] text-gray-400 font-semibold">px</span>
              </div>
            </div>

            <input
              type="range"
              min={120}
              max={600}
              step={10}
              value={currentWidth}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Height */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <MoveVertical className="w-3.5 h-3.5 text-gray-400" /> Height
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-0.5 shadow-2xs">
                <input
                  type="number"
                  min={80}
                  max={800}
                  step={10}
                  value={currentHeight}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-12 text-right text-xs font-bold text-gray-900 dark:text-gray-100 bg-transparent focus:outline-hidden"
                />
                <span className="text-[10px] text-gray-400 font-semibold">px</span>
              </div>
            </div>

            <input
              type="range"
              min={100}
              max={600}
              step={10}
              value={currentHeight}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Quick Size Presets */}
        <div className="pt-1">
          <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Quick Size Presets
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {getPresets().map((preset) => {
              const isActive =
                currentWidth === preset.w && currentHeight === preset.h;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDesign({ width: preset.w, height: preset.h })}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border text-center truncate",
                    isActive
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-2xs"
                      : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
