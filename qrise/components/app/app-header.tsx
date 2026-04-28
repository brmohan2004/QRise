"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus, Flag } from "lucide-react";
import { FeedbackModal } from "./feedback-modal";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { NotificationDropdown } from "./notification-dropdown";

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Basic title logic
  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Dashboard";
    if (path.startsWith("/qr-codes")) return "QR Codes";
    if (path.startsWith("/create")) return "Create QR";
    if (path.startsWith("/forms")) return "Form Builder";
    if (path.startsWith("/api-manager")) return "API Manager";
    if (path.startsWith("/settings")) return "Settings";
    return "App";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 outline-none"
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <SheetContent side="left">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarNav isMobile={true} onNavClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-bold tracking-tight">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild className="flex gap-2 h-9 px-2 sm:px-4 font-bold rounded-lg shadow-sm transition-all active:scale-95">
          <Link href="/create">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFeedbackOpen(true)}
          className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-400"
          title="Send Feedback"
        >
          <Flag className="h-5 w-5" />
        </Button>
        <NotificationDropdown />
      </div>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </header>
  );
}
