"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Info, Clock, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  description: string | null;
  ip_allowlist: string[] | null;
  expires_at: string | null;
  last_ip: string | null;
  environment: string;
}

export function EditKeyDialog({ 
  open, 
  onOpenChange, 
  apiKey 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKey | null;
}) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [ipAllowlist, setIpAllowlist] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (apiKey) {
      setDescription(apiKey.description || "");
      setIpAllowlist(apiKey.ip_allowlist?.join(", ") || "");
      setExpiresAt(apiKey.expires_at ? new Date(apiKey.expires_at).toISOString().split('T')[0] : "");
    }
  }, [apiKey]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!apiKey) return;
      const res = await fetch(`/api/v1/api-keys/${apiKey.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          description, 
          ip_allowlist: ipAllowlist.split(",").map(ip => ip.trim()).filter(Boolean),
          expires_at: expiresAt || null
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to update key");
      }
      return (await res.json()).data;
    },
    onSuccess: () => {
      toast.success("API key updated successfully");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  if (!apiKey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gray-900 p-10 text-white">
          <DialogTitle className="text-2xl font-black flex items-center gap-4">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
              <Globe className="h-6 w-6" />
            </div>
            Edit API Key: <span className="text-emerald-400">{apiKey.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2 font-medium">
            Update settings for this key. Permissions (scopes) cannot be modified after creation.
          </DialogDescription>
        </div>

        <div className="p-10 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description</label>
            <Input 
              placeholder="What is this key used for?" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 rounded-xl font-medium" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">IP Allowlist</label>
              {apiKey.last_ip && (
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Last IP: <span className="text-gray-900">{apiKey.last_ip}</span>
                </span>
              )}
            </div>
            <Input 
              placeholder="e.g. 192.168.1.1, 10.0.0.0/24" 
              value={ipAllowlist} 
              onChange={e => setIpAllowlist(e.target.value)} 
              className="h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 rounded-xl font-medium" 
            />
            <p className="text-[9px] text-gray-400 font-medium ml-1">Comma-separated IPs or CIDR ranges. Leave empty to allow all IPs.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Expiration Date
            </label>
            <Input 
              type="date"
              value={expiresAt} 
              onChange={e => setExpiresAt(e.target.value)} 
              className="h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 rounded-xl font-medium" 
            />
            <p className="text-[9px] text-gray-400 font-medium ml-1 text-amber-600">The key will stop working after this date. Leave empty for no expiration.</p>
          </div>

          <div className="pt-4 flex gap-4">
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-xl border-gray-200 font-black uppercase text-[10px] tracking-widest"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => updateMutation.mutate()} 
              disabled={updateMutation.isPending} 
              className="flex-1 bg-gray-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl shadow-xl gap-2"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
