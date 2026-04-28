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
      <SheetContent side="right" className="w-[70%] p-0 border-l border-gray-100/50">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* Decorative background element */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-gray-50/50 -z-10" />
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 bg-[#0F6E56]/5 blur-[80px] rounded-full" />

        <div className="flex flex-col h-full px-6">
          {/* Header with Logo */}
          <div className="flex items-center h-16 border-b border-gray-100/50">
            <Link
              href="/"
              className="flex items-center gap-2.5"
              onClick={closeMenu}
            >
              <img
                src="/logo.png"
                alt="QRise Logo"
                className="h-9 w-9 object-contain"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                QRise
              </span>
            </Link>
          </div>

          <div className="flex-1 py-8 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
              Menu
            </div>
            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-2 rounded-xl text-[0.8125rem] font-medium transition-all duration-200",
                      isActive
                        ? "bg-[#0F6E56]/5 text-[#0F6E56] shadow-sm ring-1 ring-[#0F6E56]/10"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                      isActive ? "bg-[#0F6E56]/10" : "bg-gray-100 group-hover:bg-gray-200"
                    )}>
                      <item.icon className={cn("h-4 w-4", isActive ? "text-[#0F6E56]" : "text-gray-500")} />
                    </div>
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  closeMenu();
                  onOpenFeedback();
                }}
                className="w-full group flex items-center gap-3 px-4 py-2 rounded-xl text-[0.8125rem] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <Flag className="h-4 w-4 text-gray-500" />
                </div>
                Send Feedback
              </button>
            </nav>
          </div>

          {/* CTA Buttons */}
          <div className="py-8 border-t border-gray-100/50 space-y-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Account
            </div>
            <div className="grid gap-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[0.8125rem] font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all active:scale-[0.98]"
              >
                <LogIn className="h-4.5 w-4.5" />
                Log in
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[0.8125rem] font-semibold text-white bg-[#0F6E56] hover:bg-[#0d5c48] shadow-lg shadow-[#0F6E56]/20 transition-all active:scale-[0.98]"
              >
                <UserPlus className="h-4.5 w-4.5" />
                Start free
              </Link>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4 px-4">
              Join 10,000+ teams building better experiences.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
