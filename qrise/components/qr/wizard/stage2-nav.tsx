"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Stage2NavProps {
  type: string;
}

export function Stage2Nav({ type }: Stage2NavProps) {
  const { isDynamic, setDynamic } = useWizardStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-3 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:mt-8 sm:pt-6 sm:border-t sm:border-slate-100 sm:dark:border-slate-800 shadow-lg sm:shadow-none">
      <div className="flex items-center justify-between gap-3">
        {/* Dynamic vs Static Toggle (replaces Change Type at bottom) */}
        <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-2 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl border border-slate-200/70 dark:border-slate-700/60 transition-all select-none">
          <div
            className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              isDynamic
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              {isDynamic ? "Dynamic" : "Static"}
            </span>
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hidden xs:inline-block">
              {isDynamic ? "Editable" : "Direct"}
            </span>
          </div>
          <Switch
            id="stage2-dynamic-toggle"
            checked={isDynamic}
            onCheckedChange={setDynamic}
            className="scale-90 ml-1"
          />
        </div>

        {/* Proceed to Stage 3 */}
        <Link
          href={`/create/design?type=${type}`}
          className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-sm shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
        >
          <span>Design QR</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
