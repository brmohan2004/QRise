'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Megaphone, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnnouncementComposer({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    type: 'info',
    linkText: '',
    linkUrl: '',
    showToPlans: 'all',
    endsAt: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/infra/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          showToPlans: formData.showToPlans === 'all' ? null : [formData.showToPlans],
        }),
      });

      if (!res.ok) throw new Error('Failed to create');

      toast.success('Announcement published');
      setFormData({ message: '', type: 'info', linkText: '', linkUrl: '', showToPlans: 'all', endsAt: '' });
      onCreated();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const previewColors = {
    info: 'bg-blue-50 border-blue-500 text-blue-700',
    warning: 'bg-amber-50 border-amber-500 text-amber-700',
    success: 'bg-emerald-50 border-emerald-500 text-emerald-700',
    error: 'bg-red-50 border-red-500 text-red-700',
  };

  return (
    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white/90">System Broadcast</CardTitle>
        <CardDescription className="text-white/40">Push a global notification to users.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Type</label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/80 h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Success / New Feature</SelectItem>
                  <SelectItem value="error">Emergency / Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Target Plans</label>
              <Select 
                value={formData.showToPlans} 
                onValueChange={(val) => setFormData({ ...formData, showToPlans: val })}
              >
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white/80 h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="free">Free Only</SelectItem>
                  <SelectItem value="pro">Pro Only</SelectItem>
                  <SelectItem value="business">Business / Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Message (Markdown)</label>
            <Textarea 
              placeholder="What's happening?" 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="min-h-[100px] bg-white/[0.03] border-white/10 text-white/80 text-sm focus:ring-1 focus:ring-white/20"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Link Text</label>
              <Input 
                placeholder="e.g. Learn More" 
                value={formData.linkText}
                onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                className="bg-white/[0.03] border-white/10 text-white/80 h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Link URL</label>
              <Input 
                placeholder="https://..." 
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="bg-white/[0.03] border-white/10 text-white/80 h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Expiration</label>
              <Input 
                type="date" 
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                className="bg-white/[0.03] border-white/10 text-white/80 h-10 text-xs"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-3">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">Live Preview</span>
            <div className={cn(
              "p-4 rounded-lg border flex items-start justify-between transition-all",
              formData.type === 'info' && "bg-blue-500/5 border-blue-500/20 text-blue-200",
              formData.type === 'warning' && "bg-amber-500/5 border-amber-500/20 text-amber-200",
              formData.type === 'error' && "bg-red-500/5 border-red-500/20 text-red-200",
              formData.type === 'success' && "bg-emerald-500/5 border-emerald-500/20 text-emerald-200",
            )}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Megaphone className="h-4 w-4 opacity-70" />
                </div>
                <div className="flex-1 text-sm font-medium">
                  {formData.message || "Broadcast content will appear here..."}
                </div>
              </div>
              {formData.linkText && <span className="text-xs font-bold underline ml-4 whitespace-nowrap">{formData.linkText} →</span>}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-white text-black hover:bg-white/90 font-bold h-12 text-sm" 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Publish Announcement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
