"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutGrid, CreditCard, FileText, ShoppingCart } from "lucide-react";
import { FeedbackModal } from "@/components/app/feedback-modal";
import { PublicHeader } from "@/components/public/public-header";
import { PublicSidebar } from "@/components/public/public-sidebar";

const navigation = [
  { name: "Features", href: "/features", icon: LayoutGrid },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
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

  return (
    <div className="min-h-screen bg-white">
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

      {/* Main content */}
      <main>{children}</main>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}