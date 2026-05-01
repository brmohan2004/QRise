"use client";

import Link from "next/link";
import { QrCode, Menu, Flag } from "lucide-react";
import { LucideIcon } from "lucide-react";

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
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="QRise Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">QRise</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
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
              className="text-sm font-medium text-white bg-[#0F6E56] px-4 py-2 rounded-full hover:bg-[#0d5c48] transition-colors"
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
