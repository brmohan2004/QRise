'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomTypeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/custom-types/${id}`)
      .then(r => r.json())
      .then(d => { setDetails(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  const { type, resolver, recent_calls } = details;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">{type.name}</h2>
      <p className="text-gray-400">@{type.slug}</p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Fields Schema */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle>Fields Schema</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-zinc-950 p-4 rounded overflow-auto text-xs">{JSON.stringify(type.fields_schema, null, 2)}</pre>
          </CardContent>
        </Card>

        {/* Resolver Config */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle>Resolver Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><span className="text-gray-400">URL:</span> {resolver?.resolver_url}</div>
            <div><span className="text-gray-400">Timeout:</span> {resolver?.timeout_ms} ms</div>
            <div><span className="text-gray-400">Fallback URL:</span> {resolver?.fallback_url || '—'}</div>
            <div><span className="text-gray-400">Retry on Fail:</span> {resolver?.retry_on_fail ? 'Yes' : 'No'}</div>
            <div><span className="text-gray-400">Total Calls:</span> {resolver?.total_calls || 0}</div>
            <div><span className="text-gray-400">Total Errors:</span> {resolver?.total_errors || 0}</div>
            <div><span className="text-gray-400">Avg Latency:</span> {resolver?.avg_latency_ms || 0} ms</div>
            <Button className="mt-4" size="sm" onClick={() => {
              fetch(`/api/v1/types/${type.slug}/resolver/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              })
                .then(r => r.json())
                .then(data => toast.success('Test completed', { description: JSON.stringify(data) }))
                .catch(err => toast.error('Test failed'));
            }}>
              <Send className="h-4 w-4 mr-2" /> Send Test Request
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Resolver Calls */}
      <Card className="bg-zinc-900 border-zinc-800 mt-4">
        <CardHeader><CardTitle>Recent Resolver Calls (last 50)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Latency (ms)</TableHead>
                <TableHead>Response Type</TableHead>
                <TableHead>Fallback Used</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent_calls?.map((c: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className={c.resolver_status >= 400 ? 'text-red-500' : 'text-green-500'}>{c.resolver_status}</TableCell>
                  <TableCell>{c.resolver_latency_ms}</TableCell>
                  <TableCell>{c.response_type || '—'}</TableCell>
                  <TableCell>{c.fallback_used ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(c.called_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
