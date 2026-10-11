"use client";

import { useRouter, usePathname } from "next/navigation";
import { QrCode, FormInput, ChevronRight } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTitle 
} from "@/components/ui/sheet";
import { useCreateSheetStore } from "@/stores/create-sheet.store";
import { useWizardStore } from "@/stores/qr-wizard.store";

export function CreateSheet() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, close, setOpen } = useCreateSheetStore();

  const handleCreateQR = () => {
    useWizardStore.getState().reset();
    close();
    const target = pathname ? `/create?from=${encodeURIComponent(pathname)}` : "/create";
    router.push(target);
  };

  const handleCreateForm = () => {
    close();
    router.push("/forms/create");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent 
        side="bottom" 
        showCloseButton={false}
        className="rounded-t-[32px] p-5 pb-7 bg-white dark:bg-slate-900 border-none shadow-[0_-12px_45px_rgba(0,0,0,0.18)] outline-none max-w-lg mx-auto"
      >
        <SheetTitle className="sr-only">Create New Item</SheetTitle>

        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 mt-1" />

        <div className="space-y-3">
          {/* Create QR Code */}
          <button
            type="button"
            onClick={handleCreateQR}
            className="w-full p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-4 text-left group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">Create QR Code</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  Popular
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                Dynamic or static QR codes with branding & analytics
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Create Form */}
          <button
            type="button"
            onClick={handleCreateForm}
            className="w-full p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-4 text-left group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
              <FormInput className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">Create Form</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Builder
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                Custom forms & surveys to collect and analyze responses
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
