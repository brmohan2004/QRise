'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export function EndpointBreakdownTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/api-usage?range=24h')
      .then(r => r.json())
      .then(d => { setData(d.by_endpoint || []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Endpoint</TableHead>
            <TableHead>Calls</TableHead>
            <TableHead>Avg Latency (ms)</TableHead>
            <TableHead>Error Rate (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="font-mono text-xs">{row.endpoint}</TableCell>
              <TableCell>{row.calls.toLocaleString()}</TableCell>
              <TableCell>{row.avg_latency_ms}</TableCell>
              <TableCell className={row.error_rate > 5 ? 'text-red-500' : row.error_rate > 1 ? 'text-yellow-500' : 'text-green-500'}>
                {row.error_rate.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
