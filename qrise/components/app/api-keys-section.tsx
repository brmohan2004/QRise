import { useState } from "react";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SCOPES = [
  { id: "qr:read", label: "Read QR Codes" },
  { id: "qr:write", label: "Manage QR Codes" },
  { id: "analytics:read", label: "View Analytics" },
  { id: "forms:read", label: "Read Submissions" },
  { id: "bulk:write", label: "Bulk Operations" },
];

const KeyModal = ({ open, generatedKey, onClose }: { open: boolean; generatedKey: string | null; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
      <div className="bg-indigo-600 p-8 text-white">
        <DialogTitle className="text-2xl font-black flex items-center gap-3"><ShieldCheck className="h-7 w-7" />API Key Generated</DialogTitle>
        <DialogDescription className="text-white/80">Copy now. We won&apos;t show it again.</DialogDescription>
      </div>
      <div className="p-8 space-y-4">
        <div className="p-4 bg-slate-900 text-indigo-400 font-mono text-sm rounded-xl break-all">{generatedKey}</div>
        <p className="text-xs text-amber-700 font-bold uppercase">DO NOT SHARE THIS KEY</p>
        <Button onClick={onClose} className="w-full h-12 bg-slate-900 font-black uppercase text-xs rounded-xl">I&apos;ve copied it</Button>
      </div>
    </DialogContent>
  </Dialog>
);

export function ApiKeysSection() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["qr:read"]);
  const [showKey, setShowKey] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery({ queryKey: ["api-keys"], queryFn: async () => { const res = await fetch("/api/api-keys"); return (await res.json()).data || []; } });
  
  const createMutation = useMutation({
    mutationFn: async () => { const res = await fetch("/api/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, scopes }) }); if (!res.ok) throw new Error(); return (await res.json()).data; },
    onSuccess: (data) => { setShowKey(data.rawKey); setName(""); setScopes(["qr:read"]); queryClient.invalidateQueries({ queryKey: ["api-keys"] }); },
    onError: () => toast.error("Failed to create key")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/api-keys/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["api-keys"] }); toast.success("Key revoked"); },
    onError: () => toast.error("Failed to revoke")
  });

  const toggleScope = (id: string) => setScopes(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-6">
        <Card className="flex-1 rounded-3xl border-slate-200/60 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-black uppercase">Generate New Key</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs font-black uppercase text-slate-400">Key Name</label><Input placeholder="e.g. Production" value={name} onChange={e => setName(e.target.value)} className="bg-slate-50/50" /></div>
            <div className="grid grid-cols-2 gap-2">{SCOPES.map(s => (<div key={s.id} className="flex items-center gap-2"><Checkbox id={s.id} checked={scopes.includes(s.id)} onCheckedChange={() => toggleScope(s.id)} /><label htmlFor={s.id} className="text-sm">{s.label}</label></div>))}</div>
            <Button onClick={() => createMutation.mutate()} disabled={!name} className="w-full bg-indigo-600 font-bold h-10 rounded-lg"><Plus className="h-4 w-4 mr-2" />{createMutation.isPending ? "Creating..." : "Generate API Key"}</Button>
          </CardContent>
        </Card>
        <div className="xl:w-72 p-6 bg-amber-50 border border-amber-100 rounded-3xl">
          <div className="flex items-center gap-2 text-amber-700 mb-2"><ShieldCheck className="h-5 w-5" /><span className="text-sm font-bold">Security</span></div>
          <p className="text-xs text-amber-600">Never share keys. They provide full account access.</p>
        </div>
      </div>

      <Card className="rounded-3xl border-slate-200/60 shadow-sm">
        <div className="px-6 py-4 border-b bg-slate-50/50"><h3 className="font-black text-sm uppercase text-slate-400">Active API Keys</h3></div>
        {isLoading ? <div className="p-12 text-center text-slate-400">Loading...</div> : !keys?.length ? <div className="p-12 text-center text-slate-400 italic">No API keys found</div> : (
          <table className="w-full text-sm"><thead className="border-b text-slate-400 text-xs font-black uppercase"><tr><th className="px-6 py-3 text-left">Name</th><th className="px-6 py-3 text-left">Prefix</th><th className="px-6 py-3 text-left">Scopes</th><th className="px-6 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y">{keys.map((k: any) => (<tr key={k.id} className="hover:bg-slate-50"><td className="px-6 py-3 font-bold">{k.name}</td><td className="px-6 font-mono text-xs">{k.keyPrefix}...</td><td className="px-6"><div className="flex gap-1">{k.scopes?.map((s: string) => (<span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase">{s}</span>))}</div></td><td className="px-6 py-3 text-right"><Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(k.id)}><Trash2 className="h-4 w-4" /></Button></td></tr>))}</tbody></table>
        )}
      </Card>
      <KeyModal open={!!showKey} generatedKey={showKey} onClose={() => setShowKey(null)} />
    </div>
  );
}