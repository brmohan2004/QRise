import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OverviewHeader() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Industrial Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Your projects at a glance
        </p>
      </div>

      <Link href="/qrise-matrix/projects/new">
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl shadow-sm shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </Button>
      </Link>
    </div>
  );
}
