'use client'

import { useState, useEffect } from 'react';
import { RateLimitCard } from '@/components/rate-limits/rate-limit-card';
import { RateLimitPerUserOverride } from '@/components/rate-limits/rate-limit-per-user-override';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function RateLimitsPage() {
  const [hasRecentChanges, setHasRecentChanges] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/admin/rate-limits/status');
        const data = await res.json();
        setHasRecentChanges(data.changedRecently);
      } catch (e) {
        console.error(e);
      }
    };
    checkStatus();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-white">Rate Limits</h2>
          {hasRecentChanges && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-1 flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold tracking-wide uppercase">Plan limits changed in last 24h</span>
            </Badge>
          )}
        </div>
      </div>
      <RateLimitCard />
      <RateLimitPerUserOverride />
    </div>
  );
}
