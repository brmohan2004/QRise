"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, X } from "lucide-react";

export function OnboardingCard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if not dismissed previously
    const dismissed = localStorage.getItem("qrise-onboarding-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("qrise-onboarding-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-br from-[#0F6E56]/10 to-transparent border border-[#0F6E56]/20 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 overflow-hidden">
      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss info"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center transform -rotate-3">
        <QrCode className="w-12 h-12 text-[#0F6E56] opacity-30" />
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Create your first QR code</h2>
        <p className="text-gray-600 mb-5 max-w-xl">
          Get started by creating a dynamic QR code. You can update its destination URL anytime, even after it's been printed.
        </p>
        <Link 
          href="/create"
          className="inline-flex items-center gap-2 bg-[#0F6E56] hover:bg-[#0d5c48] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <QrCode className="w-4 h-4" /> Create QR
        </Link>
      </div>
    </div>
  );
}
