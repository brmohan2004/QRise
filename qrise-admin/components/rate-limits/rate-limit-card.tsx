'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PlanLimits {
  id: string;
  plan: string;
  rpm: number;
  rpd: number;
  maxBurst: number;
  imageRendersPerMonth: number;
  embedRendersPerMonth: number;
  resolverCallsPerMonth: number;
  apiCallsPerMonth: number;
  maxWebhooks: number;
  maxCustomTypes: number;
  maxResolverTimeoutMs: number;
}

export function RateLimitCard() {
  const [plans, setPlans] = useState<PlanLimits[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/rate-limits')
      .then(r => r.json())
      .then(data => { setPlans(data.plans || []); setLoading(false); });
  }, []);

  const handleSave = async (plan: string, updates: Partial<PlanLimits>) => {
    setSaving(plan);
    try {
      const res = await fetch(`/api/admin/rate-limits/${plan}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(`Limits for ${plan} updated`);
        // Refresh
        const data = await (await fetch('/api/admin/rate-limits')).json();
        setPlans(data.plans);
      } else {
        toast.error('Failed to update');
      }
    } catch (_e) {
      toast.error('Error updating');
    } finally {
      setSaving(null);
    }
  };

  const handleFieldChange = (plan: string, field: keyof PlanLimits, value: string) => {
    setPlans(prev => prev.map(p => p.plan === plan ? { ...p, [field]: parseInt(value) || 0 } : p));
  };

  if (loading) return <div className="flex justify-center"><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map(plan => (
        <Card key={plan.id} className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="capitalize text-white">{plan.plan}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PlanField label="RPM" value={plan.rpm} onChange={v => handleFieldChange(plan.plan, 'rpm', v)} />
            <PlanField label="RPD" value={plan.rpd} onChange={v => handleFieldChange(plan.plan, 'rpd', v)} />
            <PlanField label="Max Burst" value={plan.maxBurst} onChange={v => handleFieldChange(plan.plan, 'maxBurst', v)} />
            <PlanField label="API Calls/Month" value={plan.apiCallsPerMonth} onChange={v => handleFieldChange(plan.plan, 'apiCallsPerMonth', v)} />
            <PlanField label="Image Renders/Month" value={plan.imageRendersPerMonth} onChange={v => handleFieldChange(plan.plan, 'imageRendersPerMonth', v)} />
            <PlanField label="Embed Renders/Month" value={plan.embedRendersPerMonth} onChange={v => handleFieldChange(plan.plan, 'embedRendersPerMonth', v)} />
            <PlanField label="Resolver Calls/Month" value={plan.resolverCallsPerMonth} onChange={v => handleFieldChange(plan.plan, 'resolverCallsPerMonth', v)} />
            <PlanField label="Max Webhooks" value={plan.maxWebhooks} onChange={v => handleFieldChange(plan.plan, 'maxWebhooks', v)} />
            <PlanField label="Max Custom Types" value={plan.maxCustomTypes} onChange={v => handleFieldChange(plan.plan, 'maxCustomTypes', v)} />
            <PlanField label="Max Resolver Timeout (ms)" value={plan.maxResolverTimeoutMs} onChange={v => handleFieldChange(plan.plan, 'maxResolverTimeoutMs', v)} />
            <Button size="sm" onClick={() => handleSave(plan.plan, plans.find(p => p.plan === plan.plan)!)} disabled={saving === plan.plan}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PlanField({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <label className="text-gray-400">{label}</label>
      <Input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-32 bg-zinc-800 border-zinc-700 text-white" />
    </div>
  );
}
