"use client";

import { useState } from "react";
import { ShieldCheck, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SCOPE_LABELS, type ApiScope } from "@/lib/api/scope-registry";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const KeyRevealModal = ({ open, generatedKey, onClose }: { open: boolean; generatedKey: string | null; onClose: () => void }) => {
  const [saved, setSaved] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && saved) onClose(); }}>
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
          <div className="group relative">
            <div className="p-5 bg-gray-900 text-emerald-400 font-mono text-sm rounded-2xl break-all shadow-inner border border-gray-800 leading-relaxed pr-12">
              {generatedKey}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-3 top-3 h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
              onClick={() => {
                navigator.clipboard.writeText(generatedKey || "");
                toast.success("Key copied to clipboard");
              }}
            >
              <ShieldCheck className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest leading-tight">
              Warning: This key will NOT be shown again.
            </p>
          </div>

          <div className="flex items-center space-x-3 p-1">
            <Checkbox 
              id="saved-confirm" 
              checked={saved} 
              onCheckedChange={(checked) => setSaved(!!checked)}
            />
            <label htmlFor="saved-confirm" className="text-xs font-bold text-gray-600 cursor-pointer">
              I have saved this key in a secure location
            </label>
          </div>

          <Button 
            onClick={onClose} 
            disabled={!saved}
            className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            Close & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function CreateKeyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState<"live" | "test">("live");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["qr:read"]);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [ipAllowlist, setIpAllowlist] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          description, 
          environment, 
          scopes: selectedScopes,
          ip_allowlist: ipAllowlist.split(",").map(ip => ip.trim()).filter(Boolean)
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to create key");
      }
      return (await res.json()).data;
    },
    onSuccess: (data) => {
      setShowKey(data.raw_key);
      setName("");
      setDescription("");
      setIpAllowlist("");
      setSelectedScopes(["qr:read"]);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev => 
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gray-900 p-10 text-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-4">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              Create API Key
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2 font-medium">
              Configure permissions and environment for your new access key.
            </DialogDescription>
          </div>

          <div className="p-10 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Key Name</label>
                <Input 
                  placeholder="e.g. Mobile App" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Environment</label>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <button
                    onClick={() => setEnvironment("live")}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      environment === "live" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Live
                  </button>
                  <button
                    onClick={() => setEnvironment("test")}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      environment === "test" ? "bg-white text-amber-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Sandbox
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description (Optional)</label>
              <Input 
                placeholder="What is this key used for?" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                Scopes
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-4 bg-gray-900 text-white rounded-2xl">
                      Select the permissions this key will have.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(SCOPE_LABELS).map(([scope, label]) => (
                  <div 
                    key={scope} 
                    className={cn(
                      "flex items-start gap-3 p-4 border rounded-2xl transition-all cursor-pointer group",
                      selectedScopes.includes(scope) 
                        ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200" 
                        : "bg-white border-gray-100 hover:border-emerald-100"
                    )}
                    onClick={() => toggleScope(scope)}
                  >
                    <Checkbox 
                      id={scope} 
                      checked={selectedScopes.includes(scope)} 
                      onCheckedChange={() => toggleScope(scope)}
                      className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div className="space-y-1">
                      <label htmlFor={scope} className="text-xs font-bold text-gray-900 block cursor-pointer">{scope}</label>
                      <p className="text-[10px] text-gray-500 font-medium leading-tight">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">IP Allowlist (Optional)</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-[9px] font-black uppercase tracking-widest text-primary px-2"
                  onClick={async () => {
                    const res = await fetch("/api/detect-ip");
                    const data = await res.json();
                    if (data.ip) {
                      setIpAllowlist(prev => prev ? `${prev}, ${data.ip}` : data.ip);
                    }
                  }}
                >
                  Add Current IP
                </Button>
              </div>
              <Input 
                placeholder="e.g. 192.168.1.1, 10.0.0.0/24" 
                value={ipAllowlist} 
                onChange={e => setIpAllowlist(e.target.value)} 
                className="h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium" 
              />
              <p className="text-[9px] text-gray-400 font-medium ml-1">Comma-separated IPs or CIDR ranges. Leave empty to allow all IPs.</p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => createMutation.mutate()} 
                disabled={!name || createMutation.isPending} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {createMutation.isPending ? "Generating..." : "Generate API Key"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <KeyRevealModal open={!!showKey} generatedKey={showKey} onClose={() => setShowKey(null)} />
    </>
  );
}

