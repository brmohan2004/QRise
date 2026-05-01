'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Activity, Key, Flag } from 'lucide-react';
import { toast } from 'sonner';

export default function UserApiDetailsPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/api-usage/users/${userId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [userId]);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">User API Details</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Keys */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle>API Keys</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Calls</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.keys?.map((k: any) => (
                  <TableRow key={k.id}>
                    <TableCell>{k.name}</TableCell>
                    <TableCell>{k.environment}</TableCell>
                    <TableCell className="text-xs">{k.scopes?.join(', ')}</TableCell>
                    <TableCell>{k.calls_this_month}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => toast.info('Revoke not implemented')}>Revoke</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Timeline chart placeholder */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle>Usage Timeline (7d)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              [Chart: calls per day] — integrate Recharts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By endpoint */}
      <Card className="bg-zinc-900 border-zinc-800 mt-4">
        <CardHeader><CardTitle>By Endpoint</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Calls</TableHead>
                <TableHead>Avg Latency</TableHead>
                <TableHead>Error Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.by_endpoint?.map((e: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{e.endpoint}</TableCell>
                  <TableCell>{e.calls}</TableCell>
                  <TableCell>{e.avg_latency} ms</TableCell>
                  <TableCell>{e.error_rate.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button variant="outline"><Flag className="h-4 w-4 mr-2" /> Flag for Review</Button>
        <Button variant="secondary"><Activity className="h-4 w-4 mr-2" /> Add Rate Limit Override</Button>
      </div>

      {/* Recent errors */}
      {data.errors?.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800 mt-4">
          <CardHeader><CardTitle>Recent Errors (24h)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.errors.map((err: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs max-w-xs truncate">{err.endpoint}</TableCell>
                    <TableCell className="text-red-500">{err.status_code}</TableCell>
                    <TableCell>{err.latency_ms} ms</TableCell>
                    <TableCell>{new Date(err.called_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
