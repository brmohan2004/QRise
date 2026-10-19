"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LayoutGrid, CreditCard, FileText } from "lucide-react";
import { FeedbackModal } from "@/components/app/feedback-modal";
import { PublicHeader } from "@/components/public/public-header";
import { PublicSidebar } from "@/components/public/public-sidebar";
import { motion } from "framer-motion";

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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 250);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Subtle top focus line on route navigation */}
      {isTransitioning && (
        <div 
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-[60] h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-focus-shimmer" 
        />
      )}

      <PublicHeader 
        navigation={navigation}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      <PublicSidebar 
        navigation={navigation}
        pathname={pathname}
        isOpen={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      {/* Main content with staggered blur-in / focus reveal */}
      <motion.main
        key={pathname}
        initial={{ opacity: 0, filter: "blur(6px)", y: 6, scale: 0.998 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
        transition={{
          duration: 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="stagger-blur-focus"
      >
        {children}
      </motion.main>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}