import Link from 'next/link';
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
            <CheckCircle2 className="w-24 h-24 text-green-500 relative animate-bounce" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-white">Payment Successful!</h1>
          <p className="text-zinc-400 text-lg">
            Welcome to the premium club. Your account has been upgraded and you now have full access to all features.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-medium">Subscription Active</p>
              <p className="text-zinc-500 text-sm">Your features are now unlocked</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            href="/dashboard"
            className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/settings/billing"
            className="w-full bg-zinc-800 text-white font-semibold py-4 rounded-xl hover:bg-zinc-700 transition-all"
          >
            Manage Billing
          </Link>
        </div>
        
        <p className="text-zinc-500 text-sm">
          A receipt has been sent to your email address.
        </p>
      </div>
    </div>
  );
}
