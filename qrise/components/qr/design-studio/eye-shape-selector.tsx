"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { cn } from "@/lib/utils";

const EYE_STYLES = [
  { id: "square", label: "Square" },
  { id: "extra_rounded", label: "Soft" },
  { id: "dot", label: "Dot" },
  { id: "rounded", label: "Rounded" },
] as const;

export function EyeShapeSelector() {
  const { design, setDesign } = useWizardStore();
  const currentEyeStyle = design.eyeStyle || "square";

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Eye Shape</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {EYE_STYLES.map((style) => {
          const isSelected = currentEyeStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => setDesign({ ...design, eyeStyle: style.id as any })}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-[#0F6E56] bg-[#0F6E56]/5"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
            >
              <div 
                className="h-8 w-8 border-[3px] border-current flex items-center justify-center p-[2px]"
                style={{
                  borderRadius: style.id.includes("rounded") ? "25%" : style.id === "dot" ? "50%" : "0%"
                }}
              >
                <div 
                  className="w-full h-full bg-current" 
                  style={{
                    borderRadius: style.id.includes("rounded") ? "20%" : style.id === "dot" ? "50%" : "0%"
                  }}
                />
              </div>
              <span className="text-[10px] font-medium">{style.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
