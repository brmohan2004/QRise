"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, Menu, X, LayoutGrid, CreditCard, FileText, LogIn, UserPlus, Flag } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { FeedbackModal } from "@/components/app/feedback-modal";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Features", href: "/features", icon: LayoutGrid },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  { name: "Docs", href: "/docs", icon: FileText },
];

export default function PublicLayout({
  children,
  pricingEnabled = true,
}: {
  children: React.ReactNode;
  pricingEnabled?: boolean;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const filteredNavigation = navigation;

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F6E56]">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">QRise</span>
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {filteredNavigation.map((item) => (
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
                onClick={() => setFeedbackOpen(true)}
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
                className="text-sm font-medium text-white bg-[#0F6E56] px-4 py-2 rounded-lg hover:bg-[#0d5c48] transition-colors"
              >
                Start free
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={() => setFeedbackOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <Flag className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 border-l border-gray-100/50">
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
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F6E56] shadow-lg shadow-[#0F6E56]/20">
                          <QrCode className="h-5 w-5 text-white" />
                        </div>
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
                        {filteredNavigation.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "group flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                                isActive 
                                  ? "bg-[#0F6E56]/5 text-[#0F6E56] shadow-sm ring-1 ring-[#0F6E56]/10" 
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              )}
                            >
                              <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                isActive ? "bg-[#0F6E56]/10" : "bg-gray-100 group-hover:bg-gray-200"
                              )}>
                                <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-[#0F6E56]" : "text-gray-500")} />
                              </div>
                              {item.name}
                            </Link>
                          );
                        })}
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setFeedbackOpen(true);
                          }}
                          className="w-full group flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                            <Flag className="h-4.5 w-4.5 text-gray-500" />
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
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all active:scale-[0.98]"
                        >
                          <LogIn className="h-5 w-5" />
                          Log in
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold text-white bg-[#0F6E56] hover:bg-[#0d5c48] shadow-lg shadow-[#0F6E56]/20 transition-all active:scale-[0.98]"
                        >
                          <UserPlus className="h-5 w-5" />
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
            </div>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main>{children}</main>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}