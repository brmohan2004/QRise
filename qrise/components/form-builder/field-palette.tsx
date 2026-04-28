"use client";

import { useDraggable } from "@dnd-kit/core";
import { 
  Type, 
  Mail, 
  Phone, 
  AlignLeft, 
  ChevronDown, 
  CheckSquare, 
  Calendar, 
  FileUp, 
  Signature,
  Plus,
  Sparkles,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldType } from "@/types/form.types";

interface PaletteItemData {
  type: FieldType;
  label: string;
  icon: LucideIcon;
}

const paletteItems: PaletteItemData[] = [
  { type: "text", label: "Text Input", icon: Type },
  { type: "email", label: "Email Address", icon: Mail },
  { type: "phone", label: "Phone Number", icon: Phone },
  { type: "textarea", label: "Long Text", icon: AlignLeft },
  { type: "dropdown", label: "Dropdown Menu", icon: ChevronDown },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "date", label: "Date Picker", icon: Calendar },
  { type: "file", label: "File Upload", icon: FileUp },
  { type: "signature", label: "Signature", icon: Signature },
];

import { useEffect, useState } from "react";

function DesktopPaletteItem({ type, label, icon: Icon }: PaletteItemData) {
  const [mounted, setMounted] = useState(false);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${type}`,
    data: { type },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getCategoryColor = (type: FieldType) => {
    if (["text", "email", "phone", "textarea"].includes(type)) return "from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-100";
    if (["dropdown", "checkbox"].includes(type)) return "from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-100";
    return "from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-100";
  };

  const colorClass = getCategoryColor(type);

  return (
    <div
      ref={setNodeRef}
      {...(mounted ? listeners : {})}
      {...(mounted ? attributes : {})}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border bg-white cursor-grab transition-all duration-300",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-[1.02] hover:border-emerald-500/30",
        "active:scale-95 active:shadow-inner"
      )}
    >
      <div className={cn("p-2.5 rounded-lg bg-gradient-to-br shadow-sm", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[11px] font-black text-gray-700 tracking-tight uppercase">{label}</span>
    </div>
  );
}

interface FieldPaletteProps {
  leftWidth: number;
  startResizingLeft: (e: React.MouseEvent) => void;
  isResizingLeft: boolean;
}

export function FieldPalette({ leftWidth, startResizingLeft, isResizingLeft }: FieldPaletteProps) {
  return (
    <aside 
      className="hidden lg:flex border-r bg-slate-50/50 p-6 overflow-y-auto shrink-0 flex flex-col gap-8 relative group backdrop-blur-sm"
      style={{ width: `${leftWidth}px` }}
    >
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-[#0F6E56] text-white shadow-lg shadow-[#0F6E56]/20">
            <Plus className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Field Palette</h3>
        </div>
        
        <div className="space-y-8">
          {[
            { id: "Basic", icon: Type, color: "text-blue-500" },
            { id: "Choices", icon: CheckSquare, color: "text-amber-500" },
            { id: "Special", icon: Sparkles, color: "text-purple-500" }
          ].map((cat) => (
            <div key={cat.id} className="relative">
              <div className="flex items-center gap-2 mb-4">
                <cat.icon className={cn("h-3 w-3", cat.color)} />
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{cat.id}</h4>
              </div>
              <div className="flex flex-col gap-2.5">
                {paletteItems
                  .filter((i) => (cat.id === "Basic" && ["text", "email", "phone", "textarea"].includes(i.type)) ||
                    (cat.id === "Choices" && ["dropdown", "checkbox"].includes(i.type)) ||
                    (cat.id === "Special" && ["date", "file", "signature"].includes(i.type)))
                  .map((item) => (
                    <DesktopPaletteItem key={item.type} {...item} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Resize Handle Left */}
      <div
        onMouseDown={startResizingLeft}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50 transition-all duration-200",
          "hover:bg-[#0F6E56]/20 border-r border-transparent hover:border-[#0F6E56]/30",
          isResizingLeft && "bg-[#0F6E56]/40 border-[#0F6E56]/50 w-2"
        )}
      >
        <div className="absolute inset-y-0 right-0 w-[1px] bg-slate-200" />
      </div>
    </aside>
  );
}

export { paletteItems };
