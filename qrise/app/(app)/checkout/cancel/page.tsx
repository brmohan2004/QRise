import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
            <XCircle className="w-24 h-24 text-red-500 relative" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-white">Payment Cancelled</h1>
          <p className="text-zinc-400 text-lg">
            No worries! Your payment was not processed. If you had trouble during checkout, feel free to try again.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <RefreshCw className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-white font-medium">Changed your mind?</p>
              <p className="text-zinc-500 text-sm">You can always upgrade later from settings.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            href="/pricing"
            className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Pricing
          </Link>
          <Link 
            href="/dashboard"
            className="w-full bg-zinc-800 text-white font-semibold py-4 rounded-xl hover:bg-zinc-700 transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
        
        <p className="text-zinc-500 text-sm">
          Need help? <Link href="/contact" className="text-indigo-400 hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
