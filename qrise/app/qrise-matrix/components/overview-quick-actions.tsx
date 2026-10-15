import React from "react";
import Link from "next/link";
import { 
  Barcode, 
  PenTool, 
  Store, 
  Code2 
} from "lucide-react";

const ACTIONS = [
  {
    label: "Create Label",
    icon: Barcode,
    href: "/qrise-matrix/projects",
  },
  {
    label: "Design Label",
    icon: PenTool,
    href: "/qrise-matrix/projects",
  },
  {
    label: "Marketplace",
    icon: Store,
    href: "/qrise-matrix/marketplace",
  },
  {
    label: "Developer Hub",
    icon: Code2,
    href: "/qrise-matrix/devhub",
  },
];

export function OverviewQuickActions() {
  return (
    <div className="space-y-3">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 sm:p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-110 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
