"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Flag } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface PublicHeaderProps {
  navigation: NavigationItem[];
  onOpenMobileMenu: () => void;
  onOpenFeedback: () => void;
}

export function PublicHeader({
  navigation,
  onOpenMobileMenu,
  onOpenFeedback,
}: PublicHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isScrolled
          ? "pt-3 sm:pt-4 px-3 sm:px-6 pointer-events-none"
          : "w-full bg-white/80 backdrop-blur-md border-b border-gray-100"
      )}
    >
      <nav
        className={cn(
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto",
          isScrolled
            ? "mx-auto max-w-5xl lg:max-w-6xl rounded-2xl sm:rounded-full bg-white/90 backdrop-blur-xl border border-gray-200/90 shadow-md shadow-gray-900/5 px-4 sm:px-6 h-14"
            : "w-full max-w-none px-4 sm:px-6 lg:px-[100px] h-16"
        )}
      >
        <div className="flex h-full items-center justify-between">
          {/* Logo (QRise text removed) */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center group"
              aria-label="QRise Home"
            >
              <img
                src="/logo.png"
                alt="QRise Logo"
                className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onOpenFeedback}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
              title="Send Feedback"
            >
              <Flag className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-900 hover:text-[#0F6E56] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-[#0F6E56] px-4 py-2 rounded-full hover:bg-[#0d5c48] transition-colors shadow-sm"
            >
              Start free
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenFeedback}
              className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <Flag className="h-5 w-5" />
            </button>
            <button
              onClick={onOpenMobileMenu}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
