"use client";

import { useRouter } from "next/navigation";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { qrTypesList, getQRTypeInfo } from "./types-config";
import type { QRType } from "@/types/qr.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ChangeTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentType?: QRType | null;
}

export function ChangeTypeDialog({
  open,
  onOpenChange,
  currentType,
}: ChangeTypeDialogProps) {
  const router = useRouter();
  const { setType, qrType } = useWizardStore();
  const activeType = currentType || qrType || "url";

  const handleSelect = (newType: QRType) => {
    if (newType === activeType) {
      onOpenChange(false);
      return;
    }

    setType(newType);
    onOpenChange(false);
    toast.success(`Switched to ${getQRTypeInfo(newType).name}`);
    router.push(`/create/${newType}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="space-y-1 mb-4 text-left">
          <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Switch QR Type
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium">
            Your QR name and design styles will be preserved.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {qrTypesList.map((item) => {
            const isSelected = activeType === item.type;
            const Icon = item.icon;

            return (
              <button
                key={item.type}
                type="button"
                onClick={() => handleSelect(item.type)}
                className={cn(
                  "relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 group active:scale-[0.98]",
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-600/20 shadow-sm"
                    : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-sm"
                )}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/40"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {isSelected ? (
                  <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
