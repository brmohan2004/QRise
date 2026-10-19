import React from "react";
import { 
  LayoutGrid, 
  Barcode, 
  PlusCircle, 
  BarChart3, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceTab = "overview" | "labels" | "analytics" | "settings";

interface WorkspaceNavTabsProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
}

const TABS: { id: WorkspaceTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "labels", label: "My Labels", icon: Barcode },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export function WorkspaceNavTabs({ activeTab, onTabChange }: WorkspaceNavTabsProps) {
  return (
    <div className="border-b border-slate-200/90 dark:border-slate-800 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-6 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-1.5 py-3 px-2 sm:px-3 text-xs font-bold transition-all duration-150 whitespace-nowrap shrink-0 outline-none",
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
              <span>{tab.label}</span>

              {/* Bottom active line */}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
