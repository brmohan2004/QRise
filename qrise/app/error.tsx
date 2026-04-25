"use client";

import { useEffect } from "react";
import { QrCode, RotateCcw, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 text-center border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
            <QrCode className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-bold text-sm uppercase tracking-widest">System Error</span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The application encountered an unexpected error. Don't worry, your data is safe.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-slate-50 rounded-xl text-left border border-slate-100">
            <p className="text-xs font-mono text-slate-400 uppercase mb-1">Error Message</p>
            <p className="text-sm font-mono text-red-500 break-words">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => reset()}
            className="h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          
          <Button 
            asChild
            variant="ghost"
            className="h-12 text-slate-500 font-bold rounded-xl hover:bg-slate-50"
          >
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-top border-slate-50 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          Error ID: {error.digest || "unknown_failure"}
        </div>
      </div>
    </div>
  );
}