import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ChevronRight, 
  Package, 
  ShoppingCart, 
  HeartPulse 
} from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  industry: string;
  labelsCount: number;
  scansCount: string;
  status: "Active" | "Paused" | "Archived";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const PROJECTS: ProjectItem[] = [
  {
    id: "courier-tracking",
    name: "Courier Tracking",
    industry: "Postal & Tracking",
    labelsCount: 428,
    scansCount: "2.1k",
    status: "Active",
    icon: Package,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "product-inventory",
    name: "Product Inventory",
    industry: "Retail & Supermarkets",
    labelsCount: 520,
    scansCount: "4.8k",
    status: "Active",
    icon: ShoppingCart,
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "medical-equipment",
    name: "Medical Equipment",
    industry: "Healthcare & Hospitals",
    labelsCount: 300,
    scansCount: "1.7k",
    status: "Active",
    icon: HeartPulse,
    iconBg: "bg-purple-50 dark:bg-purple-950/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

export function OverviewProjectsList() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          My Projects
        </h2>
        <Link 
          href="/qrise-matrix/projects"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Projects Cards List */}
      <div className="space-y-2.5">
        {PROJECTS.map((project) => {
          const Icon = project.icon;
          return (
            <Link
              key={project.id}
              href={`/qrise-matrix/projects`}
              className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 sm:p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Icon Box */}
                <div className={`w-11 h-11 rounded-2xl ${project.iconBg} ${project.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight truncate">
                    {project.name}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {project.industry}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {project.labelsCount} labels <span className="mx-1">·</span> {project.scansCount} scans
                  </p>
                </div>
              </div>

              {/* Status Badge & Chevron */}
              <div className="flex items-center gap-2.5 shrink-0 ml-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                  {project.status}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
