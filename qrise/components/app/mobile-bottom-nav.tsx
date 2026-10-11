"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Home, 
  QrCode, 
  Plus, 
  FormInput, 
  ShoppingCart,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetTitle
} from "@/components/ui/sheet";
import { useWizardStore } from "@/stores/qr-wizard.store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHomeActive = pathname === "/dashboard";
  const isQrActive = pathname.startsWith("/qr-codes");
  const isFormsActive = pathname.startsWith("/forms") && !pathname.includes("/forms/create");
  const isMarketplaceActive = pathname.startsWith("/marketplace");

  if (!mounted) return null;
  if (pathname === "/profile" || pathname?.startsWith("/profile")) return null;

  return (
    <>
      {/* Floating Bottom Nav Bar with Curved Edges */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-3 inset-x-3 sm:inset-x-4 max-w-md mx-auto z-50 lg:hidden pointer-events-none select-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
      >
        <div className="relative pointer-events-auto">
          <div className="flex items-end justify-between w-full h-[64px] relative">
            {/* Left Nav Group - Curved Left Edge */}
            <div className="flex-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-y border-l border-slate-200/90 dark:border-slate-800 rounded-l-[28px] h-[64px] flex items-center justify-around px-2 pb-0.5">
              {/* Home */}
              <Link
                href="/dashboard"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95",
                  isHomeActive
                    ? "text-primary font-bold"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center transition-transform duration-200",
                  isHomeActive && "scale-110"
                )}>
                  <Home className="w-5 h-5" />
                  {isHomeActive && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight whitespace-nowrap">Home</span>
              </Link>

              {/* My QRs */}
              <Link
                href="/qr-codes"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95",
                  isQrActive
                    ? "text-primary font-bold"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center transition-transform duration-200",
                  isQrActive && "scale-110"
                )}>
                  <QrCode className="w-5 h-5" />
                  {isQrActive && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight whitespace-nowrap">My QRs</span>
              </Link>
            </div>

            {/* Center Notched Cradle Section */}
            <div className="w-[88px] h-[64px] relative shrink-0">
              <svg
                viewBox="0 0 88 64"
                className="w-full h-full fill-white/95 dark:fill-slate-900/95"
                preserveAspectRatio="none"
              >
                {/* Cradle Body Fill */}
                <path
                  d="M 0 0 C 20 0, 24 38, 44 38 C 64 38, 68 0, 88 0 L 88 64 L 0 64 Z"
                />
                {/* Top Border Curve */}
                <path
                  d="M 0 0 C 20 0, 24 38, 44 38 C 64 38, 68 0, 88 0"
                  fill="none"
                  stroke="rgba(226, 232, 240, 0.9)"
                  strokeWidth="1"
                  className="dark:stroke-slate-800"
                />
                {/* Bottom Border Line */}
                <path
                  d="M 0 64 L 88 64"
                  fill="none"
                  stroke="rgba(226, 232, 240, 0.9)"
                  strokeWidth="1"
                  className="dark:stroke-slate-800"
                />
              </svg>

              {/* Elevated Circular Center Button with '+' (Add Button) */}
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-2xl shadow-black/35 active:scale-90 hover:scale-105 transition-all duration-200 z-30 group ring-4 ring-white/90 dark:ring-slate-900/90 outline-none"
                aria-label="Add New QR or Form"
              >
                <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-300 group-hover:rotate-90 group-active:scale-90" />
              </button>
            </div>

            {/* Right Nav Group - Curved Right Edge */}
            <div className="flex-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-y border-r border-slate-200/90 dark:border-slate-800 rounded-r-[28px] h-[64px] flex items-center justify-around px-2 pb-0.5">
              {/* My Forms */}
              <Link
                href="/forms"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95",
                  isFormsActive
                    ? "text-primary font-bold"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center transition-transform duration-200",
                  isFormsActive && "scale-110"
                )}>
                  <FormInput className="w-5 h-5" />
                  {isFormsActive && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight whitespace-nowrap">My Forms</span>
              </Link>

              {/* Marketplace */}
              <Link
                href="/marketplace"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95",
                  isMarketplaceActive
                    ? "text-primary font-bold"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center transition-transform duration-200",
                  isMarketplaceActive && "scale-110"
                )}>
                  <ShoppingCart className="w-5 h-5" />
                  {isMarketplaceActive && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight whitespace-nowrap">Marketplace</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Create Sheet Modal (Clean, No Header Text, No Close Button) */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        {isCreateOpen && (
          <SheetContent 
            side="bottom" 
            showCloseButton={false}
            className="rounded-t-[32px] p-5 pb-6 bg-white dark:bg-slate-900 border-none shadow-[0_-12px_45px_rgba(0,0,0,0.18)] outline-none"
          >
            {/* Accessible title for screen readers */}
            <SheetTitle className="sr-only">Create New Options</SheetTitle>

            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 mt-1" />

            <div className="space-y-3 max-w-sm mx-auto">
              {/* Create QR Code */}
              <button
                type="button"
                onClick={() => {
                  useWizardStore.getState().reset();
                  setIsCreateOpen(false);
                  router.push("/create");
                }}
                className="w-full p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-4 text-left group active:scale-[0.98]"
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
                onClick={() => {
                  setIsCreateOpen(false);
                  router.push("/forms/create");
                }}
                className="w-full p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-4 text-left group active:scale-[0.98]"
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
        )}
      </Sheet>
    </>
  );
}
