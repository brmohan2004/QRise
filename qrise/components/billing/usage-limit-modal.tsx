'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowUpRight, Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { useUsageLimit } from '@/lib/hooks/use-usage-limit';

export const UsageLimitModal: React.FC = () => {
  const { isOpen, plan, canEnableOverages, closeModal } = useUsageLimit();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  
  const onClose = closeModal;

  const handleEnableOverages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/user/overages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setConfirmed(true);
      toast.success('Pay-as-you-go billing enabled successfully!');
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        // Reload or update global state if needed
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error('Failed to enable overages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800"
        >
          {/* Header */}
          <div className="p-6 pb-0 flex justify-between items-start">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertCircle size={28} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Usage Limit Reached
            </h2>
            
            {plan === 'free' ? (
              <>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Your <span className="font-semibold text-zinc-900 dark:text-zinc-100">Free Plan</span> limit has been reached. Upgrade to a premium plan to continue generating QR codes and using the API.
                </p>
                <div className="space-y-3">
                  <a
                    href="/pricing"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 no-underline"
                  >
                    Upgrade Now <ArrowUpRight size={18} />
                  </a>
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  You've reached your monthly limit for the <span className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">{plan} Plan</span>. 
                  Would you like to enable <span className="text-indigo-600 font-semibold">Pay-As-You-Go</span> billing for additional requests?
                </p>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 mb-6">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    Additional requests will be calculated and added to your next billing cycle automatically.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleEnableOverages}
                    disabled={loading || confirmed}
                    className={`w-full py-3 px-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                      confirmed 
                        ? 'bg-green-600 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : confirmed ? (
                      <>Enabled <Check size={20} /></>
                    ) : (
                      'Confirm & Continue'
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer Decoration */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
