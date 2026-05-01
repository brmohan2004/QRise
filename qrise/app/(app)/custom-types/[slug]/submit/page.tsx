'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SubmitMarketplacePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [typeData, setTypeData] = useState<any>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch(`/api/v1/types/${params.slug}`)
      .then(r => r.json())
      .then(res => {
        if (res.ok) setTypeData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/types/${params.slug}/marketplace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      
      if (data.ok) {
        toast.success('Submitted for review!');
        router.push('/developer?tab=custom-types');
      } else {
        toast.error(data.error?.message || 'Submission failed');
      }
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!typeData) {
    return (
      <div className="p-8 text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold">Type not found</h2>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const checks = [
    { label: 'Type is Public', status: typeData.is_public },
    { label: 'Has Description', status: !!typeData.description },
    { label: 'Has Icon URL', status: !!typeData.icon_url },
    { label: 'Has Resolver Configured', status: !!typeData.resolver?.url },
  ];

  const allPassed = checks.every(c => c.status);

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Submit to Marketplace</h1>
        <p className="text-zinc-400">
          Share your custom type <strong>@{typeData.slug}</strong> with the QRise community.
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-900/50">
          <CardTitle className="text-lg">Pre-flight Checklist</CardTitle>
          <CardDescription>All requirements must be met before submission.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800">
            {checks.map((check, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <span className="text-sm font-medium">{check.label}</span>
                {check.status ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-zinc-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!allPassed ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3 text-amber-500">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Missing Requirements</p>
            <p className="opacity-80">Please ensure your type is public and has all metadata configured before submitting.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Submission Notes (Optional)</label>
            <Textarea 
              placeholder="Tell our moderators what this type is used for and who it's for..." 
              className="bg-zinc-900 border-zinc-800 h-32"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg group"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <>
                Submit for Review
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
          
          <p className="text-center text-xs text-zinc-500">
            Review typically takes 1-3 business days. You will be notified via webhook and email.
          </p>
        </div>
      )}
    </div>
  );
}