import React from "react";
import { 
  FolderKanban, 
  Plus, 
  Truck, 
  HeartPulse, 
  ShoppingBag, 
  Warehouse, 
  Factory, 
  Apple, 
  Ticket,
  Construction
} from "lucide-react";
import { Button } from "@/components/ui/button";

const INDUSTRIES = [
  { name: "Postal & Tracking", icon: Truck, count: "Templates: Code 128, GS1-128", color: "from-blue-500 to-cyan-500" },
  { name: "Healthcare & Hospitals", icon: HeartPulse, count: "Templates: DataMatrix, ISBT", color: "from-rose-500 to-pink-500" },
  { name: "Retail & Supermarkets", icon: ShoppingBag, count: "Templates: EAN-13, UPC-A", color: "from-amber-500 to-orange-500" },
  { name: "Logistics & Warehousing", icon: Warehouse, count: "Templates: SSCC-18, Pallet", color: "from-indigo-500 to-purple-500" },
  { name: "Manufacturing & Automotive", icon: Factory, count: "Templates: DPM, PDF417", color: "from-slate-600 to-slate-800" },
  { name: "Food, Agriculture & Produce", icon: Apple, count: "Templates: GS1 DataBar, Batch", color: "from-emerald-500 to-teal-500" },
  { name: "Entertainment & Events", icon: Ticket, count: "Templates: Aztec, Turnstile Pass", color: "from-violet-500 to-fuchsia-500" },
];

export function ProjectsPlaceholder() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Industrial Projects
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Construction className="w-3 h-3 animate-spin" />
              Under Development
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and organize industrial barcode labels, scan analytics, and print batches grouped by project.
          </p>
        </div>

        <Button disabled className="opacity-70 bg-primary font-medium rounded-xl h-10 px-4 flex items-center gap-2 cursor-not-allowed">
          <Plus className="w-4 h-4" />
          Create Project
        </Button>
      </div>

      {/* Industry Templates Preview */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
          Supported Industrial Verticals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {INDUSTRIES.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.name}
                className="group relative rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ind.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {ind.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {ind.count}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
