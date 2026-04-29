'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Calendar, Clock, Loader2, Play } from 'lucide-react';

export function MaintenanceWindowForm({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    startsAt: '',
    endsAt: '',
    allowReadOnly: true,
    affectedFeatures: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/infra/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          affectedFeatures: formData.affectedFeatures.split(',').map(s => s.trim()).filter(Boolean)
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create');
      }

      toast.success('Maintenance window scheduled');
      setFormData({ title: '', message: '', startsAt: '', endsAt: '', allowReadOnly: true, affectedFeatures: '' });
      onCreated();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 opacity-50" />
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white/90">Infrastructure Window</CardTitle>
        <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Plan system evolution</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Internal Title</label>
            <Input 
              placeholder="e.g. Database Migration v2" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white/[0.03] border-white/10 text-white/80 h-10 text-xs"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">User-facing Message</label>
            <Textarea 
              placeholder="What will users see on the maintenance page?" 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="min-h-[80px] bg-white/[0.03] border-white/10 text-white/80 text-sm focus:ring-1 focus:ring-white/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Starts At</label>
              <Input 
                type="datetime-local" 
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                className="bg-white/[0.03] border-white/10 text-white/80 h-10 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Ends At (Optional)</label>
              <Input 
                type="datetime-local" 
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                className="bg-white/[0.03] border-white/10 text-white/80 h-10 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Affected Features</label>
              <Input 
                placeholder="e.g. auth, api, dashboard (comma separated)" 
                value={formData.affectedFeatures}
                onChange={(e) => setFormData({ ...formData, affectedFeatures: e.target.value })}
                className="bg-white/[0.03] border-white/10 text-white/80 h-10 text-xs"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 min-w-[180px]">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-white/80 block">Read-Only</label>
                <p className="text-[10px] text-white/30">Allow viewing</p>
              </div>
              <Switch 
                checked={formData.allowReadOnly}
                onCheckedChange={(val) => setFormData({ ...formData, allowReadOnly: val })}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-3">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">User Preview</span>
            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg text-amber-200 text-sm space-y-1">
              <p className="font-black uppercase tracking-widest text-[10px] opacity-70">Status Update</p>
              <p className="font-bold">{formData.title || 'System Maintenance'}</p>
              <p className="opacity-70 italic">{formData.message || 'We will be back shortly...'}</p>
            </div>
          </div>

          <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 text-sm" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
            Schedule Window
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
