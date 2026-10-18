"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  QrCode, 
  Plus, 
  FormInput, 
  ShoppingCart,
  FolderKanban,
  Tag,
  Sparkles,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateSheetStore } from "@/stores/create-sheet.store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { open: openCreateSheet } = useCreateSheetStore();

  // Determine whether current screen is in QRise Matrix mode
  const isMatrixMode = pathname.startsWith("/qrise-matrix");

  // Hide bottom nav bar on profile, create QR, create form screens, and developer hub
  // Also hide completely on Create Project, Create Custom Label, and Individual Project Workspace
  const isHiddenMatrixPage = 
    (pathname.startsWith("/qrise-matrix/projects/") && pathname !== "/qrise-matrix/projects") ||
    pathname.includes("/create-label") ||
    pathname.startsWith("/qrise-matrix/devhub") ||
    pathname.startsWith("/developer");

  const isHiddenRoute = 
    pathname === "/profile" || pathname.startsWith("/profile") ||
    pathname === "/create" || pathname.startsWith("/create") ||
    pathname === "/forms/create" || pathname.startsWith("/forms/create") ||
    isHiddenMatrixPage;

  if (isHiddenRoute) return null;

  // Standard Mode Active States
  const isHomeActive = pathname === "/dashboard";
  const isQrActive = pathname.startsWith("/qr-codes");
  const isFormsActive = pathname.startsWith("/forms") && !pathname.includes("/forms/create");

  // Matrix Mode Active States
  // Requested 5 items: (projects, my labels, add, market, qrise studio)
  const isMatrixProjectsActive = pathname === "/qrise-matrix/projects" || pathname === "/qrise-matrix";
  const isMatrixMyLabelsActive = pathname.startsWith("/qrise-matrix/my-labels");
  const isMatrixMarketplaceActive = pathname.startsWith("/qrise-matrix/marketplace");

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-3 inset-x-3 sm:inset-x-4 max-w-md mx-auto z-50 lg:hidden pointer-events-none select-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
    >
      <div className="relative pointer-events-auto">
        <div className="flex items-end justify-between w-full h-[64px] relative">
          {/* Left Nav Group - Curved Left Edge */}
          <div className="flex-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-y border-l border-slate-200/90 dark:border-slate-800 rounded-l-[28px] h-[64px] flex items-center justify-around px-2 pb-0.5">
            {isMatrixMode ? (
              <>
                {/* 1. Projects */}
                <Link
                  href="/qrise-matrix/projects"
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95",
                    isMatrixProjectsActive
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
                  )}
                >
                  <div className={cn(
                    "relative flex items-center justify-center transition-transform duration-200",
                    isMatrixProjectsActive && "scale-110"
                  )}>
                    <FolderKanban className="w-5 h-5" />
                    {isMatrixProjectsActive && (
                      <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight whitespace-nowrap">Projects</span>
                </Link>

                {/* 2. My Labels */}
                <Link
                  href="/qrise-matrix/my-labels"
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95",
                    isMatrixMyLabelsActive
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
                  )}
                >
                  <div className={cn(
                    "relative flex items-center justify-center transition-transform duration-200",
                    isMatrixMyLabelsActive && "scale-110"
                  )}>
                    <Tag className="w-5 h-5" />
                    {isMatrixMyLabelsActive && (
                      <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight whitespace-nowrap">My Labels</span>
                </Link>
              </>
            ) : (
              <>
                {/* Standard: Home */}
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

                {/* Standard: My QRs */}
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
              </>
            )}
          </div>

          {/* Center Notched Cradle Section: 3. Add */}
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

            {/* Elevated Circular Center Button with '+' for Add in both Modes */}
            <button
              type="button"
              onClick={() => openCreateSheet()}
              className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-2xl shadow-black/35 active:scale-90 hover:scale-105 transition-all duration-200 z-30 group ring-4 ring-white/90 dark:ring-slate-900/90 outline-none cursor-pointer"
              aria-label={isMatrixMode ? "Create Project or Custom Label" : "Add New QR or Form"}
            >
              <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-300 group-hover:rotate-90 group-active:scale-90" />
            </button>
          </div>

          {/* Right Nav Group - Curved Right Edge */}
          <div className="flex-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-y border-r border-slate-200/90 dark:border-slate-800 rounded-r-[28px] h-[64px] flex items-center justify-around px-2 pb-0.5">
            {isMatrixMode ? (
              <>
                {/* 4. Market */}
                <Link
                  href="/qrise-matrix/marketplace"
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95",
                    isMatrixMarketplaceActive
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
                  )}
                >
                  <div className={cn(
                    "relative flex items-center justify-center transition-transform duration-200",
                    isMatrixMarketplaceActive && "scale-110"
                  )}>
                    <ShoppingCart className="w-5 h-5" />
                    {isMatrixMarketplaceActive && (
                      <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight whitespace-nowrap">Market</span>
                </Link>

                {/* 5. QRise Studio */}
                <Link
                  href="/dashboard"
                  className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95 text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 font-medium"
                  title="Switch to QRise Studio"
                >
                  <div className="relative flex items-center justify-center transition-transform duration-200 hover:scale-110">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-[10px] tracking-tight whitespace-nowrap font-bold text-slate-700 dark:text-slate-300">
                    Studio
                  </span>
                </Link>
              </>
            ) : (
              <>
                {/* Standard: My Forms */}
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

                {/* Standard: QRise Matrix */}
                <Link
                  href="/qrise-matrix/projects"
                  className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 font-medium"
                  title="Switch to QRise Matrix"
                >
                  <div className="relative flex items-center justify-center transition-transform duration-200 hover:scale-110">
                    <Layers className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="text-[10px] tracking-tight whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400">
                    Matrix
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
