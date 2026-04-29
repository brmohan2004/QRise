import { Redis } from '@upstash/redis';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, Hammer, Mail } from 'lucide-react';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const dynamic = 'force-dynamic';

export default async function MaintenancePage() {
  const maintenanceMessage = await redis.get('platform:maintenance:message') || 'We are currently performing scheduled maintenance to improve our services.';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-center">
          <div className="bg-amber-100 p-4 rounded-full">
            <Hammer className="h-10 w-10 text-amber-600 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">System Maintenance</h1>
          <p className="text-slate-600 leading-relaxed">
            {maintenanceMessage as string}
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4 text-left">
          <Clock className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-900">Estimated Completion</p>
            <p className="text-xs text-slate-500 italic">We expect to be back online within 2 hours.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
          <Button asChild className="w-full py-6 text-lg font-semibold bg-slate-900 hover:bg-slate-800">
            <Link href="/">Check Status Again</Link>
          </Button>
          <div className="flex justify-center gap-2 text-sm text-slate-500">
            <Mail className="h-4 w-4" />
            <span>Need help? <a href="mailto:support@qrise.com" className="underline font-medium text-slate-700">Contact Support</a></span>
          </div>
        </div>
      </div>
    </div>
  );
}
