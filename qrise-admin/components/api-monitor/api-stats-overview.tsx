'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function ApiStatsOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/api-usage?range=24h')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;
  }

  const summary = stats?.summary || {};
  const cards = [
    { title: 'Total API Calls (24h)', value: summary.total_calls?.toLocaleString() || '0' },
    { title: 'Avg Latency', value: `${summary?.avg_latency || 0} ms` },
    { title: 'Error Rate', value: `${(summary?.error_rate || 0).toFixed(2)}%` },
    { title: 'Active API Keys', value: summary?.active_keys || 'N/A' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map(c => (
        <Card key={c.title} className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
