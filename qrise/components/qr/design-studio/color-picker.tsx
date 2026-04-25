"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { AlertTriangle } from "lucide-react";
import { calculateScannabilityScore } from "@/lib/qr-generator";

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#0F6E56",
  "#1e3a8a",
  "#4c1d95",
  "#e11d48",
  "#b45309",
  "#334155",
];

export function ColorPicker() {
  const { design, setDesign } = useWizardStore();
  const dotColor = design.dotColor || "#000000";
  const bgColor = design.bgColor || "#ffffff";

  // Using a simplified mock since qr-generator logic isn't fully implemented locally here
  // In a real implementation this would check true WCAG contrast ratio
  const isLowContrast = dotColor === bgColor;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Colors</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Dot Color */}
          <div className="space-y-3">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Pattern / Dots
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={dotColor}
                onChange={(e) => setDesign({ ...design, dotColor: e.target.value })}
                className="h-10 w-10 p-1 rounded cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={dotColor}
                onChange={(e) => setDesign({ ...design, dotColor: e.target.value })}
                className="flex-1 h-10 px-3 border border-gray-200 rounded text-sm uppercase"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setDesign({ ...design, dotColor: c })}
                  className={`h-6 w-6 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                    dotColor === c ? "ring-2 ring-offset-1 ring-[#0F6E56]" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Background
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setDesign({ ...design, bgColor: e.target.value })}
                className="h-10 w-10 p-1 rounded cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setDesign({ ...design, bgColor: e.target.value })}
                className="flex-1 h-10 px-3 border border-gray-200 rounded text-sm uppercase"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setDesign({ ...design, bgColor: c })}
                  className={`h-6 w-6 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                    bgColor === c ? "ring-2 ring-offset-1 ring-[#0F6E56]" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select background ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLowContrast && (
        <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>
            Warning: The background and dot colors don't have enough contrast. 
            This QR code may not be scannable by most cameras.
          </p>
        </div>
      )}
    </div>
  );
}
