"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Flag, ArrowLeft } from "lucide-react";
import { FeedbackModal } from "./feedback-modal";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "./notification-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isProfilePage = pathname === "/profile" || pathname?.startsWith("/profile");
  const isCreatePage = pathname === "/create" || pathname?.startsWith("/create");
  const isShowOnlyBack = isProfilePage || isCreatePage;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch current user for mobile profile avatar
  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      const json = await res.json();
      return json.data;
    },
    enabled: mounted
  });

  useEffect(() => {
    if (!mounted) return;
    const mainEl = document.getElementById("main-content");
    const handleScroll = () => {
      const scrollY = mainEl ? mainEl.scrollTop : window.scrollY;
      setIsScrolled(scrollY > 10);
    };

    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (mainEl) mainEl.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted]);

  useEffect(() => {
    if (pathname && !pathname.startsWith("/profile") && !pathname.startsWith("/create")) {
      try {
        sessionStorage.setItem("qrise_previous_screen", pathname);
      } catch (e) {}
    }
  }, [pathname]);

  const handleBack = () => {
    let fromUrl: string | null = null;
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        fromUrl = params.get("from");
        if (!fromUrl) {
          fromUrl = sessionStorage.getItem("qrise_previous_screen");
        }
      } catch (e) {}
    }

    if (fromUrl && !fromUrl.startsWith("/profile") && !fromUrl.startsWith("/create")) {
      router.push(fromUrl);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  if (isShowOnlyBack) {
    return (
      <header className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur border-b border-border/60">
        <div className="flex items-center h-14 lg:h-16 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header 
      className={cn(
        "sticky top-0 z-30 w-full transition-all duration-300 ease-in-out",
        isScrolled 
          ? "p-2 sm:p-3 lg:p-0 bg-transparent" 
          : "p-0 bg-background/95 backdrop-blur border-b border-border/60"
      )}
    >
      <div 
        className={cn(
          "flex items-center justify-between w-full transition-all duration-300",
          isScrolled 
            ? "h-13 sm:h-14 lg:h-16 px-4 lg:px-6 rounded-2xl lg:rounded-none bg-background/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 lg:border-t-0 lg:border-x-0 lg:border-b shadow-lg lg:shadow-none shadow-black/5" 
            : "h-14 lg:h-16 px-4 lg:px-6"
        )}
      >
        {/* Left side: Brand Logo for mobile screens */}
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2.5 lg:hidden active:scale-95 transition-transform"
            aria-label="QRise Home"
          >
            <Image 
              src="/logo.png" 
              alt="QRise" 
              width={28} 
              height={28} 
              className="w-7 h-7 object-contain"
            />
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              QRise
            </span>
          </Link>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Feedback Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFeedbackOpen(true)}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-400"
            title="Send Feedback"
          >
            <Flag className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Mobile Profile Icon (Direct navigation to /profile, NO popup card) */}
          <Link
            href={pathname ? `/profile?from=${encodeURIComponent(pathname)}` : "/profile"}
            className="lg:hidden flex items-center justify-center p-0.5 rounded-full hover:opacity-90 active:scale-90 transition-transform outline-none"
            aria-label="View Profile"
            title="Profile"
          >
            <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <AvatarImage src={userData?.avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </header>
  );
}
