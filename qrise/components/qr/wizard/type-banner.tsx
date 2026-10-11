"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { getQRTypeInfo } from "./types-config";
import { ChangeTypeDialog } from "./change-type-dialog";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QRType } from "@/types/qr.types";

interface TypeBannerProps {
  currentType?: QRType | null;
  stage?: 2 | 3;
}

export function TypeBanner({ currentType, stage = 2 }: TypeBannerProps) {
  const { qrType } = useWizardStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const activeType = currentType || qrType || "url";
  const typeInfo = getQRTypeInfo(activeType);
  const Icon = typeInfo.icon;

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-xs">
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {typeInfo.name}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hidden sm:inline">
              •
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline truncate">
              {typeInfo.description}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="h-8 px-3 rounded-xl font-bold text-xs gap-1.5 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shrink-0 active:scale-95 shadow-2xs"
        >
          <ArrowLeftRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Change Type</span>
        </Button>
      </div>

      <ChangeTypeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentType={activeType}
      />
    </>
  );
}
