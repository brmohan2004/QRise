'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Settings, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type CustomType = {
  id: string;
  slug: string;
  name: string;
  user_email: string;
  scan_count: number;
  qr_count: number;
  is_public: boolean;
  is_verified: boolean;
  is_suspended: boolean;
};

export function TypesTable({ scope }: { scope: 'all' | 'verified' }) {
  const [types, setTypes] = useState<CustomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspensionReason, setSuspensionReason] = useState('');

  useEffect(() => {
    fetch(`/api/admin/custom-types?scope=${scope}`)
      .then(r => r.json())
      .then(d => setTypes(d.data || []))
      .finally(() => setLoading(false));
  }, [scope]);

  const verify = async (id: string) => {
    const res = await fetch(`/api/admin/custom-types/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify' }) });
    if (res.ok) { toast.success('Verified'); /* refresh */ }
  };

  const suspend = async (id: string, reason: string) => {
    const res = await fetch(`/api/admin/custom-types/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'suspend', reason }) });
    if (res.ok) { toast.success('Suspended'); /* refresh */ }
  };

  const deleteType = async (id: string) => {
    if (!confirm('Delete permanently?')) return;
    const res = await fetch(`/api/admin/custom-types/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); /* refresh */ }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slug</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Scans</TableHead>
            <TableHead>QR Count</TableHead>
            <TableHead>Public</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Suspended</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-xs">{t.slug}</TableCell>
              <TableCell>{t.name}</TableCell>
              <TableCell>{t.user_email}</TableCell>
              <TableCell>{t.scan_count?.toLocaleString()}</TableCell>
              <TableCell>{t.qr_count}</TableCell>
              <TableCell>{t.is_public ? '✅' : '❌'}</TableCell>
              <TableCell>{t.is_verified ? '✅' : '❌'}</TableCell>
              <TableCell>{t.is_suspended ? '🚫' : '—'}</TableCell>
              <TableCell className="space-x-1">
                <Button size="icon" variant="ghost" onClick={() => toast.info('View fields not implemented')}><Eye className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => toast.info('View resolver not implemented')}><Settings className="h-4 w-4" /></Button>
                {scope === 'all' && !t.is_verified && (
                  <Button size="icon" variant="ghost" onClick={() => verify(t.id)}><Shield className="h-4 w-4" /></Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost"><AlertTriangle className="h-4 w-4 text-orange-500" /></Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
                    <DialogHeader><DialogTitle>Suspend Type</DialogTitle></DialogHeader>
                    <Textarea 
                      placeholder="Reason for suspension" 
                      value={suspensionReason}
                      onChange={e => setSuspensionReason(e.target.value)} 
                    />
                    <Button onClick={() => suspend(t.id, suspensionReason)}>Suspend</Button>
                  </DialogContent>
                </Dialog>
                <Button size="icon" variant="ghost" onClick={() => deleteType(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
