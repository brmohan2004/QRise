import { useState } from "react";
import { Plus, Trash2, ShieldCheck, AlertCircle, Key } from "lucide-react";
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
    <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
      <div className="bg-emerald-600 p-10 text-white relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
        <DialogTitle className="text-2xl font-black flex items-center gap-4 relative z-10">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          Key Generated
        </DialogTitle>
        <DialogDescription className="text-emerald-50 mt-2 font-medium opacity-90 relative z-10">
          Copy this key now. For security, we won&apos;t show it again.
        </DialogDescription>
      </div>
      <div className="p-8 space-y-6 bg-white">
        <div className="p-5 bg-gray-900 text-emerald-400 font-mono text-sm rounded-2xl break-all shadow-inner border border-gray-800 leading-relaxed">
          {generatedKey}
        </div>
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest leading-tight">Warning: Never share this key.</p>
        </div>
        <Button 
          onClick={onClose} 
          className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95"
        >
          I&apos;ve safely copied it
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export function ApiKeysSection() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["qr:read"]);
  const [showKey, setShowKey] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery({ 
    queryKey: ["api-keys"], 
    queryFn: async () => { 
      const res = await fetch("/api/api-keys"); 
      const json = await res.json();
      return json.data || json || []; 
    } 
  });
  
  const createMutation = useMutation({
    mutationFn: async () => { 
      const res = await fetch("/api/api-keys", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ name, scopes }) 
      }); 
      if (!res.ok) throw new Error(); 
      return (await res.json()).data; 
    },
    onSuccess: (data) => { 
      setShowKey(data.rawKey); 
      setName(""); 
      setScopes(["qr:read"]); 
      queryClient.invalidateQueries({ queryKey: ["api-keys"] }); 
      toast.success("Key created successfully");
    },
    onError: () => toast.error("Failed to create key")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { 
      await fetch(`/api/api-keys/${id}`, { method: "DELETE" }); 
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["api-keys"] }); 
      toast.success("Key revoked"); 
    },
    onError: () => toast.error("Failed to revoke")
  });

  const toggleScope = (id: string) => setScopes(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row gap-8">
        <Card className="flex-1 rounded-[2rem] border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">New Key</p>
            <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Generate Key</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Key Name</label>
              <Input 
                placeholder="e.g. Mobile App" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCOPES.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 transition-colors cursor-pointer group" onClick={() => toggleScope(s.id)}>
                    <Checkbox 
                      id={s.id} 
                      checked={scopes.includes(s.id)} 
                      onCheckedChange={() => toggleScope(s.id)}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" 
                    />
                    <label htmlFor={s.id} className="text-xs font-bold text-gray-600 group-hover:text-gray-900 cursor-pointer">{s.label}</label>
                  </div>
                ))}
              </div>
            </div>
            <Button 
              onClick={() => createMutation.mutate()} 
              disabled={!name || createMutation.isPending} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {createMutation.isPending ? "Generating..." : "Generate API Key"}
            </Button>
          </CardContent>
        </Card>

        <div className="xl:w-80 space-y-6">
          <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100/50 relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl group-hover:bg-emerald-200/50 transition-colors" />
            <div className="flex items-center gap-3 text-emerald-700 mb-4 relative z-10">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Security</span>
            </div>
            <p className="text-sm text-emerald-800 font-medium leading-relaxed relative z-10">
              Keys provide full access to your account. Store them securely and never expose them in client-side code.
            </p>
          </div>

          <div className="p-8 bg-gray-900 rounded-[2rem] border border-gray-800 text-white">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Usage Tip</h4>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Use different keys for production and staging environments to maintain isolated access logs.
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden bg-white">
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Active API Keys</h3>
          {keys?.length > 0 && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
              {keys.length} Active
            </span>
          )}
        </div>
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching keys...</p>
          </div>
        ) : !keys?.length ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
              <Key className="h-8 w-8 text-gray-200" />
            </div>
            <p className="text-sm font-bold text-gray-400">No API keys found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm hidden md:table">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-4 text-left font-black">Name</th>
                  <th className="px-8 py-4 text-left font-black">Prefix</th>
                  <th className="px-8 py-4 text-left font-black">Permissions</th>
                  <th className="px-8 py-4 text-right font-black">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {keys.map((k: any) => (
                  <tr key={k.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 font-black text-gray-900">{k.name}</td>
                    <td className="px-8 py-6 font-mono text-[10px] text-emerald-600 bg-emerald-50/50 rounded-lg inline-block my-4 ml-8">
                      {k.keyPrefix}...
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {k.scopes?.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[9px] font-black uppercase tracking-wider">
                            {s.split(":")[1] || s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteMutation.mutate(k.id)}
                        className="h-9 w-9 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Mobile View */}
            <div className="md:hidden divide-y divide-gray-100">
              {keys.map((k: any) => (
                <div key={k.id} className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-gray-900">{k.name}</h4>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteMutation.mutate(k.id)}
                      className="h-9 w-9 text-red-500 bg-red-50 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {k.keyPrefix}...
                    </span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {k.scopes?.map((s: string) => (
                        <span key={s} className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded text-[8px] font-bold uppercase tracking-wider border border-gray-100">
                          {s.split(":")[1] || s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      <KeyModal open={!!showKey} generatedKey={showKey} onClose={() => setShowKey(null)} />
    </div>
  );
}