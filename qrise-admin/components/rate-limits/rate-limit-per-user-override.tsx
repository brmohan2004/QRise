'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Override {
  id: string;
  user_id: string;
  override: Record<string, unknown>;
  reason?: string;
  expires_at?: string;
}

export function RateLimitPerUserOverride() {
  const [userId, setUserId] = useState('');
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [newOverride, setNewOverride] = useState<Record<string, number>>({});

  const loadOverrides = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rate-limits/overrides?user_id=${userId}`);
      const data = await res.json();
      setOverrides(data.overrides || []);
    } catch (_e) {
      toast.error('Failed to load overrides');
    } finally {
      setLoading(false);
    }
  };

  const createOverride = async () => {
    const res = await fetch('/api/admin/rate-limits/overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, override: newOverride, reason: 'Manual override' }),
    });
    if (res.ok) {
      toast.success('Override created');
      setOpen(false);
      loadOverrides();
    } else {
      toast.error('Failed to create override');
    }
  };

  const deleteOverride = async (id: string) => {
    const res = await fetch(`/api/admin/rate-limits/overrides/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Deleted');
      loadOverrides();
    } else {
      toast.error('Failed to delete');
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 mt-8">
      <CardHeader>
        <CardTitle className="text-white">Per-user Overrides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="User ID (UUID)" value={userId} onChange={e => setUserId(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
          <Button onClick={loadOverrides} disabled={!userId || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load'}
          </Button>
        </div>

        {overrides.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Overrides</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overrides.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{JSON.stringify(o.override)}</TableCell>
                  <TableCell>{o.expires_at || 'Never'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => deleteOverride(o.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!userId}><Plus className="h-4 w-4 mr-2" /> Add Override</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
            <DialogHeader><DialogTitle>Add Override for User {userId}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>RPM</Label>
                  <Input type="number" value={newOverride.rpm || ''} onChange={e => setNewOverride({ ...newOverride, rpm: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>RPD</Label>
                  <Input type="number" value={newOverride.rpd || ''} onChange={e => setNewOverride({ ...newOverride, rpd: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>API Calls/Month</Label>
                  <Input type="number" value={newOverride.apiCallsPerMonth || ''} onChange={e => setNewOverride({ ...newOverride, apiCallsPerMonth: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Max Webhooks</Label>
                  <Input type="number" value={newOverride.maxWebhooks || ''} onChange={e => setNewOverride({ ...newOverride, maxWebhooks: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <Button onClick={createOverride}>Save Override</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
