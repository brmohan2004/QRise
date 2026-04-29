"use client";

import { useState } from 'react';
import { CreditCard, Zap, Calendar, History, ExternalLink, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BillingClientProps {
  user: any;
  history: any[];
  plans: any[];
}

export default function BillingClient({ user, history, plans }: BillingClientProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handlePortalClick = async () => {
    setLoadingPortal(true);
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open portal:', error);
    } finally {
      setLoadingPortal(false);
    }
  };

  const currentPlan = plans.find(p => p.name.toLowerCase() === user.plan.toLowerCase()) || { name: 'Free' };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Current Plan Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Zap size={120} className="text-indigo-500" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-500/20">
              Current Plan
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white">{currentPlan.name}</h2>
            <p className="text-zinc-400">
              {user.billingStatus === 'active' 
                ? "Your subscription is currently active and in good standing." 
                : "Your subscription needs attention."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-zinc-300 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">Next Billing Date</p>
                <p className="font-medium">
                  {user.nextBillingDate ? format(new Date(user.nextBillingDate), 'MMMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-zinc-300 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">Payment Status</p>
                <p className="font-medium capitalize">{user.billingStatus}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handlePortalClick}
              disabled={loadingPortal}
              className="flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {loadingPortal ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Manage Subscription
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
            <button className="px-8 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all">
              Change Plan
            </button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <History className="w-5 h-5 text-zinc-500" />
          <h3 className="text-xl font-bold text-white">Billing History</h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-sm uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {history.length > 0 ? (
                  history.map((event) => (
                    <tr key={event.id} className="text-zinc-300 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        {format(new Date(event.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        ${(event.amountCents / 100).toFixed(2)} {event.currency?.toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {event.status === 'succeeded' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500" />
                          )}
                          <span className="capitalize">{event.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm font-medium">
                          Receipt
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-zinc-500 italic">
                      No billing history found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
