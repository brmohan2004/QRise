'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Submission = {
  id: string;
  type_id: string;
  type: {
    name: string;
    slug: string;
    icon_url: string;
  };
  user: {
    email: string;
    full_name: string;
  };
  status: string;
  created_at: string;
  notes?: string;
};

export function MarketplaceQueueTable() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    try {
      const res = await fetch('/api/admin/custom-types/marketplace');
      const data = await res.json();
      if (data.ok) {
        setSubs(data.data || []);
      }
    } catch (e) {
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected', reviewNotes?: string) => {
    try {
      const res = await fetch(`/api/admin/custom-types/marketplace`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes: reviewNotes }),
      });
      const data = await res.json();
      
      if (data.ok) {
        toast.success(`Submission ${status}`);
        fetchSubs(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to update submission');
      }
    } catch (e) {
      toast.error('An error occurred');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-900/50">
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400">Type</TableHead>
            <TableHead className="text-zinc-400">Owner</TableHead>
            <TableHead className="text-zinc-400">Submitted</TableHead>
            <TableHead className="text-zinc-400">Notes</TableHead>
            <TableHead className="text-right text-zinc-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-zinc-500">
                No pending submissions in the queue.
              </TableCell>
            </TableRow>
          ) : (
            subs.map(s => (
              <TableRow key={s.id} className="border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                      {s.type.icon_url ? (
                        <img src={s.type.icon_url} alt="" className="w-5 h-5 object-contain" />
                      ) : (
                        <div className="w-4 h-4 rounded-sm bg-indigo-500/20" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{s.type.name}</div>
                      <div className="text-xs text-zinc-500 font-mono">@{s.type.slug}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-zinc-300">{s.user.full_name}</div>
                  <div className="text-xs text-zinc-500">{s.user.email}</div>
                </TableCell>
                <TableCell className="text-sm text-zinc-400">
                  {new Date(s.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="text-sm text-zinc-400 truncate" title={s.notes}>
                    {s.notes || 'No notes provided'}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                    onClick={() => handleReview(s.id, 'approved')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                      <DialogHeader>
                        <DialogTitle>Reject Submission</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <p className="text-sm text-zinc-400">
                          Provide a reason for rejection. This will be sent to the type owner.
                        </p>
                        <Textarea 
                          placeholder="e.g., Missing documentation, invalid icon URL..." 
                          className="bg-zinc-950 border-zinc-800"
                          id="rejection-reason"
                        />
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => {
                            const notes = (document.getElementById('rejection-reason') as HTMLTextAreaElement).value;
                            handleReview(s.id, 'rejected', notes);
                          }}
                        >
                          Confirm Rejection
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
