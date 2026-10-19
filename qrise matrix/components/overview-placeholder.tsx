import React from "react";
import { Construction, Sparkles, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UnderDevBannerProps {
  title: string;
  description: string;
  badge?: string;
}

export function OverviewPlaceholder({ 
  title = "Industrial Projects Overview", 
  description = "Real-time telemetry, label scan statistics, and multi-industry operational insights are under development.",
  badge = "Under Development"
}: Partial<UnderDevBannerProps>) {
  return (
    <div className="space-y-6">
      {/* Hero Announcement Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold tracking-wide">
            <Construction className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {description}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/qrise-matrix/projects">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl h-10 px-4 flex items-center gap-2 shadow-lg shadow-indigo-600/30">
                Explore Projects
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 rounded-xl h-10 px-4">
                Switch to QRise Studio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Multi-Industry Telemetry</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Scan volumes, geographic distribution, and lifecycle checkpoints across postal, healthcare, logistics, and automotive sectors.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Label Design Studio</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Drag-and-drop 1D & 2D barcode designer with thermal printing support (ZPL/PDF/SVG) for industrial shipping and retail stickers.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Construction className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Connected Scan Routing</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Update shipment locations, verify specimen authenticity, and stream webhook events in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
