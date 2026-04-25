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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className={`max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="px-6 py-12 sm:p-16 text-center">
          <div className="w-20 h-20 bg-[#0F6E56]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 transform -rotate-6 transition-transform hover:rotate-0 duration-300">
            <QrCode className="w-10 h-10 text-[#0F6E56]" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Welcome to QRise!
          </h1>
          <p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto">
            You're just moments away from creating your first dynamic QR code. Here's how it works:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-900 font-semibold text-lg">1</div>
              <QrCode className="w-6 h-6 text-[#0F6E56] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Create</h3>
              <p className="text-sm text-gray-500 max-w-[200px]">Choose from 5 different types of QR codes.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-900 font-semibold text-lg">2</div>
              <PaintBucket className="w-6 h-6 text-[#0F6E56] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Customize</h3>
              <p className="text-sm text-gray-500 max-w-[200px]">Make it match your brand perfectly.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-900 font-semibold text-lg">3</div>
              <BarChart3 className="w-6 h-6 text-[#0F6E56] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Track</h3>
              <p className="text-sm text-gray-500 max-w-[200px]">See exactly who scanned it and when.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/create" 
              className="w-full sm:w-auto bg-[#0F6E56] hover:bg-[#0d5c48] text-white px-8 py-3.5 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              Create my first QR <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto text-gray-500 hover:text-gray-900 px-8 py-3.5 rounded-xl font-medium"
            >
              Skip to dashboard
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Need help? Check out our <Link href="/docs" className="text-[#0F6E56] hover:underline">documentation</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
