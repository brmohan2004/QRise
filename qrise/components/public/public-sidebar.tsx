"use client";

import Link from "next/link";
import { QrCode, LogIn, UserPlus, Flag } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface PublicSidebarProps {
  navigation: NavigationItem[];
  pathname: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenFeedback: () => void;
}

export function PublicSidebar({
  navigation,
  pathname,
  isOpen,
  onOpenChange,
  onOpenFeedback,
}: PublicSidebarProps) {
  const closeMenu = () => onOpenChange(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[85vh] rounded-t-3xl overflow-hidden p-0 border-none shadow-[0_-12px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* Premium Bottom Sheet Handle */}
        <div className="bottom-sheet-handle absolute top-0 left-0 right-0 z-20" />

        {/* Decorative background element */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-gray-50/50 -z-10" />
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 bg-[#0F6E56]/5 blur-[80px] rounded-full" />

        <div className="flex flex-col h-full px-6 pt-2">
          {/* Header with Logo */}

          <div className="flex-1 py-8 overflow-y-auto custom-scrollbar">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-2 rounded-xl text-[0.8125rem] font-bold transition-all duration-300",
                      isActive
                        ? "bg-[#0F6E56]/10 text-[#0F6E56] shadow-sm ring-1 ring-[#0F6E56]/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-[#0F6E56] text-white shadow-lg shadow-[#0F6E56]/20"
                        : "bg-gray-100 group-hover:bg-gray-200 group-hover:scale-110"
                    )}>
                      <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-500")} />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]" />
                    )}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  closeMenu();
                  onOpenFeedback();
                }}
                className="w-full group flex items-center gap-3 px-4 py-2 rounded-xl text-[0.8125rem] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-all duration-300 group-hover:scale-110">
                  <Flag className="h-4 w-4 text-gray-500" />
                </div>
                <span>Send Feedback</span>
              </button>
            </nav>
          </div>

          {/* CTA Buttons */}
          <div className="py-8 border-t border-gray-100/50 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[0.8125rem] font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[0.8125rem] font-bold text-white bg-[#0F6E56] hover:bg-[#0d5c48] shadow-lg shadow-[#0F6E56]/20 transition-all active:scale-[0.98]"
              >
                <UserPlus className="h-4 w-4" />
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
