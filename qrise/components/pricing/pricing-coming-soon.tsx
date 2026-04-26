import { CreditCard, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

export function PricingComingSoon() {
  return (
    <div className="py-24 bg-white flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0F6E56]/10 mb-8">
          <CreditCard className="h-10 w-10 text-[#0F6E56]" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pricing Plans Coming Soon
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          We're putting the finishing touches on our pricing plans to ensure you get the best value. 
          For now, enjoy all features for free!
        </p>
        
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
          <div className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Rocket className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Limited Time Offer</p>
              <p className="text-sm text-gray-500">All users get a free Pro trial automatically.</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="w-full py-4 bg-[#0F6E56] text-white rounded-xl font-bold hover:bg-[#0d5c48] transition-all shadow-lg shadow-[#0F6E56]/20 flex items-center justify-center gap-2"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/"
            className="w-full py-4 text-gray-600 font-medium hover:text-gray-900 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
