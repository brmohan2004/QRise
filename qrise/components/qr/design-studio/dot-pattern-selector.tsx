"use client";

import { useWizardStore } from "@/stores/qr-wizard.store";
import { cn } from "@/lib/utils";

const DOT_STYLES = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "extra_rounded", label: "Extra Rounded" },
  { id: "dots", label: "Dots" },
  { id: "classy", label: "Classy" },
  { id: "classy_rounded", label: "Classy Rounded" },
] as const;

export function DotPatternSelector() {
  const { design, setDesign } = useWizardStore();
  const currentStyle = design.dotStyle || "square";

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Dot Pattern</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {DOT_STYLES.map((style) => {
          const isSelected = currentStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => setDesign({ ...design, dotStyle: style.id as any })}
              className={cn(
                "flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all",
                isSelected
                  ? "border-[#0F6E56] bg-[#0F6E56]/5"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}
            >
              {/* Simple pattern abstraction using CSS styling for visual cue */}
              <div className="h-10 w-10 grid grid-cols-2 gap-1 p-1">
                {[1, 2, 3, 4].map((dot) => (
                  <div
                    key={dot}
                    className="bg-current"
                    style={{
                      borderRadius:
                        style.id.includes("rounded") || style.id === "dots"
                          ? style.id === "extra_rounded" || style.id === "dots"
                            ? "50%"
                            : "25%"
                          : "0%",
                      transform: style.id.includes("classy") ? "rotate(45deg) scale(0.8)" : "none"
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-center font-medium leading-tight">
                {style.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
