"use client";

import { AlertCircle } from "lucide-react";

interface SandboxBannerProps {
  environment: 'live' | 'test' | 'int';
}

export function SandboxBanner({ environment }: SandboxBannerProps) {
  if (environment === 'live') return null;

  return (
    <div className="bg-amber-50 border-b border-amber-100 py-3 px-6 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-500">
      <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Sandbox Environment</p>
        <p className="text-[11px] font-bold text-amber-600/80 leading-tight">
          You are viewing sandbox data. Sandbox QRs, scans, and webhooks are isolated from your live account.
        </p>
      </div>
    </div>
  );
}
