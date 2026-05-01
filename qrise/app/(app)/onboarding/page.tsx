"use client";

import Link from "next/link";
import { QrCode, PaintBucket, BarChart3, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white flex flex-col items-center justify-start">
      <div className={`max-w-3xl w-full transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="px-6 py-4 sm:p-8 text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <img src="/logo.png" alt="QRise" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-3">
            Welcome to QRise!
          </h1>
          <p className="text-xs sm:text-base text-gray-500 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
            You&apos;re just moments away from creating your first dynamic QR code. Here&apos;s how it works:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-900 font-black text-xs border border-gray-100">1</div>
              <QrCode className="w-5 h-5 text-[#0F6E56] mb-2" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-1">Create</h3>
              <p className="text-[11px] text-gray-400 font-medium max-w-[180px]">Choose from 5 different types of QR codes.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-900 font-black text-xs border border-gray-100">2</div>
              <PaintBucket className="w-5 h-5 text-[#0F6E56] mb-2" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-1">Customize</h3>
              <p className="text-[11px] text-gray-400 font-medium max-w-[180px]">Make it match your brand perfectly.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-900 font-black text-xs border border-gray-100">3</div>
              <BarChart3 className="w-5 h-5 text-[#0F6E56] mb-2" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-1">Track</h3>
              <p className="text-[11px] text-gray-400 font-medium max-w-[180px]">See exactly who scanned it and when.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              href="/create" 
              className="w-full sm:w-auto bg-[#0F6E56] hover:bg-[#0d5c48] text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-[#0F6E56]/10"
            >
              Create my first QR <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                localStorage.setItem("skipped_onboarding", "true");
                window.location.href = "/dashboard";
              }}
              className="w-full sm:w-auto text-gray-400 hover:text-gray-900 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors"
            >
              Skip to dashboard
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Need help? Check out our <Link href="/docs" target="_blank" rel="noopener noreferrer" className="text-[#0F6E56] hover:underline">documentation</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
