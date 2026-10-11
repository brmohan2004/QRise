"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Switch } from "@/components/ui/switch";

interface Stage2NavProps {
  type: string;
}

export function Stage2Nav({ type }: Stage2NavProps) {
  const { isDynamic, setDynamic } = useWizardStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-3 sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:mt-8 sm:pt-6 sm:border-t sm:border-slate-100 sm:dark:border-slate-800 shadow-lg sm:shadow-none space-y-2.5 sm:space-y-4">
      {/* Dynamic vs Static Toggle */}
      <div className="flex items-center justify-between p-2.5 sm:p-3.5 bg-slate-50/90 dark:bg-slate-800/60 rounded-xl sm:rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {isDynamic ? "Dynamic QR" : "Static QR"}
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {isDynamic ? "Editable" : "Static"}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate hidden xs:block sm:block">
              {isDynamic ? "Editable target & scan analytics" : "Direct permanent destination"}
            </p>
          </div>
        </div>

        <Switch
          id="stage2-dynamic-toggle"
          checked={isDynamic}
          onCheckedChange={setDynamic}
        />
      </div>

      {/* Stage 2 Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/create"
          className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Type</span>
        </Link>

        <Link
          href={`/create/design?type=${type}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
        >
          <span>Design QR</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
