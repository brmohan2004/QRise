"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { cn } from "@/lib/utils";
import { CopySlashIcon } from "lucide-react";

const FRAME_STYLES = [
  { id: "none", label: "None", icon: CopySlashIcon },
  { id: "simple", label: "Simple Border", preview: "border-2 border-gray-900 rounded-sm" },
  { id: "rounded", label: "Rounded", preview: "border-2 border-gray-900 rounded-2xl" },
  { id: "badge_below", label: "Badge Below", preview: "border-2 border-gray-900 rounded-lg border-b-[8px]" },
  { id: "badge_above", label: "Badge Above", preview: "border-2 border-gray-900 rounded-lg border-t-[8px]" },
  { id: "bubble", label: "Speech Bubble", preview: "border-2 border-gray-900 rounded-3xl rounded-br-none" },
] as const;

export function FrameSelector() {
  const { design, setDesign } = useWizardStore();
  const currentFrame = design.frameStyle || "none";

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Frame Style</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {FRAME_STYLES.map((frame) => {
          const isSelected = currentFrame === frame.id;
          return (
            <button
              key={frame.id}
              onClick={() => setDesign({ ...design, frameStyle: frame.id as any })}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-[#0F6E56] bg-[#0F6E56]/5"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className="h-10 w-10 flex items-center justify-center p-1 bg-white shadow-sm rounded">
                {"icon" in frame ? (
                  <frame.icon className="h-5 w-5 text-gray-400" />
                ) : (
                  <div className={cn("h-full w-full", frame.preview)} />
                )}
              </div>
              <span className="text-xs font-medium text-center">{frame.label}</span>
            </button>
          );
        })}
      </div>
      
      {currentFrame !== "none" && currentFrame !== "simple" && currentFrame !== "rounded" && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Frame Text
          </label>
          <input
            type="text"
            placeholder="e.g. Scan me!"
            maxLength={16}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0F6E56] focus:border-[#0F6E56] sm:text-sm"
          />
        </div>
      )}
    </div>
  );
}
