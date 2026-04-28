import { Home, Mail, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-10 relative">
          <div className="relative z-10">
            <Image 
              src="/logo.png" 
              alt="QRise Logo" 
              width={96} 
              height={96} 
              className="h-24 w-24 object-contain drop-shadow-2xl"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-2 text-slate-400">
            <Ghost className="h-5 w-5" />
            <span className="font-bold text-sm uppercase tracking-[0.3em]">404 Error</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Page Not Found</h1>
          <p className="text-slate-500 leading-relaxed">
            The link you followed might be broken, or the page may have been moved. 
            If you're looking for a specific QR code, check your dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-3 max-w-[240px] mx-auto">
          <Button 
            asChild
            className="h-12 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="ghost"
            className="h-12 text-slate-500 font-bold rounded-xl hover:bg-slate-50"
          >
            <Link href="mailto:support@qrise.com" className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Contact support
            </Link>
          </Button>
        </div>

        <div className="mt-16 text-[10px] text-slate-300 font-medium uppercase tracking-widest">
          &copy; 2026 QRise Inc. • All Rights Reserved
        </div>
      </div>
    </div>
  );
}