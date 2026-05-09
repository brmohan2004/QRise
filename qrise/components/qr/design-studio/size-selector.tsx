"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { cn } from "@/lib/utils";

const SHAPES = [
  {
    id: "square" as const,
    label: "Standard",
    description: "Classic square QR code",
    width: 300,
    height: 300,
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        {/* Finder top-left */}
        <rect x="4" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="7" y="7" width="8" height="8" rx="1" fill="currentColor" />
        {/* Finder top-right */}
        <rect x="30" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="33" y="7" width="8" height="8" rx="1" fill="currentColor" />
        {/* Finder bottom-left */}
        <rect x="4" y="30" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="7" y="33" width="8" height="8" rx="1" fill="currentColor" />
        {/* Data dots */}
        <rect x="21" y="5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="25" y="9" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="21" y="13" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="5" y="21" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="13" y="21" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="21" y="21" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="29" y="21" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="37" y="21" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="21" y="29" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="29" y="29" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="37" y="29" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="25" y="37" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="33" y="37" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="41" y="37" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "micro" as const,
    label: "Micro",
    description: "Compact single-finder QR",
    width: 200,
    height: 200,
    icon: (
      <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
        {/* Single finder top-left */}
        <rect x="8" y="8" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2.5" />
        <rect x="12" y="12" width="8" height="8" rx="1" fill="currentColor" />
        {/* Compact data dots */}
        <rect x="28" y="9" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="34" y="9" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="28" y="15" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="34" y="15" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="9" y="28" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="15" y="28" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="9" y="34" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="21" y="28" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="28" y="28" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="28" y="34" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="34" y="34" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "rectangular" as const,
    label: "Rectangular",
    description: "Wide format rMQR code",
    width: 400,
    height: 200,
    icon: (
      <svg viewBox="0 0 72 36" className="w-full h-full" fill="none">
        {/* Finder left */}
        <rect x="3" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="6" y="8" width="8" height="8" rx="1" fill="currentColor" />
        {/* Finder right (small) */}
        <rect x="57" y="5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="60" y="8" width="6" height="6" rx="1" fill="currentColor" />
        {/* Data dots spread wide */}
        <rect x="20" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="26" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="32" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="38" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="44" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="50" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="20" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="26" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="38" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="50" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="5" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="11" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="20" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="32" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="44" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="57" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="63" y="22" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="5" y="28" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="14" y="28" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="26" y="28" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="38" y="28" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="50" y="28" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="57" y="28" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
];

export function SizeSelector() {
  const { design, setDesign } = useWizardStore();
  const currentShape = design.shape || "square";

  const handleSelect = (shape: typeof SHAPES[number]) => {
    setDesign({
      shape: shape.id,
      width: shape.width,
      height: shape.height,
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-900 block">
        QR Shape
      </label>
      <div className="grid grid-cols-3 gap-3">
        {SHAPES.map((shape) => (
          <button
            key={shape.id}
            type="button"
            onClick={() => handleSelect(shape)}
            className={cn(
              "group flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200",
              currentShape === shape.id
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100"
                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 mb-2 transition-transform duration-200 group-hover:scale-110",
                currentShape === shape.id
                  ? "text-emerald-600"
                  : "text-gray-400"
              )}
            >
              {shape.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">
              {shape.label}
            </span>
            <span
              className={cn(
                "text-[9px] mt-0.5 leading-tight",
                currentShape === shape.id
                  ? "text-emerald-500"
                  : "text-gray-400"
              )}
            >
              {shape.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
