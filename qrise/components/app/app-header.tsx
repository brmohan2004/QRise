"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 backdrop-blur px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 transition-all active:scale-90 text-slate-600 outline-none"
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="rounded-t-[32px] p-0 border-none shadow-[0_-8px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

            {/* Premium Bottom Sheet Handle */}
            <div className="bottom-sheet-handle absolute top-0 left-0 right-0 z-20" />

            <div className="flex flex-col h-full pt-0">
              <SidebarNav isMobile={true} onNavClick={() => setOpen(false)} className="border-none" />
            </div>
          </SheetContent>
        </Sheet>

      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button asChild className="flex gap-2 h-8 sm:h-9 px-3 sm:px-4 font-black uppercase text-[10px] sm:text-xs rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95">
          <Link href="/create">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Create</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFeedbackOpen(true)}
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-400"
          title="Send Feedback"
        >
          <Flag className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <NotificationDropdown />
      </div>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </header>
  );
}
