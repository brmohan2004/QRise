"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";

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

export function EyeAndFrameColorPicker() {
  const { design, setDesign } = useWizardStore();
  const eyeColor = design.eyeColor || design.dotColor || "#000000";
  const frameColor = design.frameColor || design.dotColor || "#000000";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Eye Color */}
        <div className="space-y-3">
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Eye Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={eyeColor}
              onChange={(e) => setDesign({ ...design, eyeColor: e.target.value })}
              className="h-8 w-8 p-1 rounded cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={eyeColor}
              onChange={(e) => setDesign({ ...design, eyeColor: e.target.value })}
              className="flex-1 h-8 px-2 border border-gray-200 rounded text-xs uppercase"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setDesign({ ...design, eyeColor: c })}
                className={`h-5 w-5 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                  eyeColor === c ? "ring-2 ring-offset-1 ring-[#0F6E56]" : "border-gray-200"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Frame Color */}
        <div className="space-y-3">
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Frame Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={frameColor}
              onChange={(e) => setDesign({ ...design, frameColor: e.target.value })}
              className="h-8 w-8 p-1 rounded cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={frameColor}
              onChange={(e) => setDesign({ ...design, frameColor: e.target.value })}
              className="flex-1 h-8 px-2 border border-gray-200 rounded text-xs uppercase"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setDesign({ ...design, frameColor: c })}
                className={`h-5 w-5 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                  frameColor === c ? "ring-2 ring-offset-1 ring-[#0F6E56]" : "border-gray-200"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
