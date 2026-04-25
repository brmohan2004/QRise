"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, QrCode, BarChart3, Zap, Shield } from "lucide-react";

export function Hero() {
  const [dots, setDots] = useState<number[]>([]);

  useEffect(() => {
    // Generate 25 random starting positions for animation
    const positions = Array.from({ length: 25 }, (_, i) => 
      Math.random() * 100
    );
    setDots(positions);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white pt-16 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              The QR platform built for{" "}
              <span className="text-[#0F6E56]">real results</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Create dynamic QR codes that track every scan — change destinations anytime without
              reprinting. Powerful analytics, design tools, and integrations for modern
              teams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-[#0F6E56] rounded-lg hover:bg-[#0d5c48] transition-colors"
              >
                Start for free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                See it live
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">10,000+</p>
                <p className="text-sm text-gray-500">QR codes created</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">2M+</p>
                <p className="text-sm text-gray-500">scans tracked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">Free</p>
                <p className="text-sm text-gray-500">forever to start</p>
              </div>
            </div>
          </div>

          {/* Animated QR code graphic */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#0F6E56]/20 to-emerald-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* QR Code visualization */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-6 flex items-center justify-center overflow-hidden">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#0F6E56 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                <div className="relative w-full h-full border-[3px] border-[#0F6E56]/10 rounded-2xl p-4">
                  {/* Corner markers - Modern rounded style */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#0F6E56] rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#0F6E56] rounded-md" />
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 border-4 border-[#0F6E56] rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#0F6E56] rounded-md" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-4 border-[#0F6E56] rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#0F6E56] rounded-md" />
                  </div>

                  {/* QR Pattern Dots */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {Array.from({ length: 49 }).map((_, i) => {
                        // Skip areas where markers and center logo are
                        const row = Math.floor(i / 7);
                        const col = i % 7;
                        const isMarkerArea = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
                        const isCenterArea = row >= 2 && row <= 4 && col >= 2 && col <= 4;
                        
                        if (isMarkerArea) return <div key={i} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 opacity-0" />;
                        
                        return (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-500 ${
                              isCenterArea ? "bg-[#0F6E56]/20" : "bg-[#0F6E56]"
                            }`}
                            style={{
                              animation: `pulseDots 3s ease-in-out ${i * 0.05}s infinite`,
                              opacity: isCenterArea ? 0.3 : 1
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Center Logo Placeholder */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0F6E56] to-emerald-500 rounded-xl flex items-center justify-center text-white">
                      <QrCode className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating glassmorphism badges */}
              <div className="absolute -top-6 -right-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 px-4 py-3 flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Status</p>
                  <p className="text-sm font-bold text-gray-900">Dynamic</p>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 px-4 py-3 flex items-center gap-3 animate-bounce-slow-delayed">
                <div className="w-10 h-10 bg-[#0F6E56]/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-[#0F6E56]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Scans</p>
                  <p className="text-sm font-bold text-gray-900">+124% Up</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for animation */}
      <style jsx>{`
        @keyframes pulseDots {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.85); opacity: 0.7; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-bounce-slow-delayed {
          animation: bounce-slow 4s ease-in-out 2s infinite;
        }
      `}</style>
    </section>
  );
}