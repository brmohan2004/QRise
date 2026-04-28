import { FileText, Hammer, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DocsComingSoon() {
  return (
    <div className="py-24 bg-white flex items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0F6E56]/10 mb-8">
          <FileText className="h-10 w-10 text-[#0F6E56]" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          We are working on this
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Our documentation is currently being written to provide you with the most comprehensive guide. 
          Please check back soon!
        </p>
        
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8 text-left">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Hammer className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Under Construction</p>
              <p className="text-sm text-gray-500">We're building something great for you.</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-4 bg-[#0F6E56] text-white rounded-xl font-bold hover:bg-[#0d5c48] transition-all shadow-lg shadow-[#0F6E56]/20 flex items-center justify-center gap-2"
          >
            Back to Home
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
