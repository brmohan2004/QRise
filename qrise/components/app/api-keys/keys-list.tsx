"use client";

import { Trash2, Key, Calendar, Activity, ExternalLink, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function KeysList() {
  const queryClient = useQueryClient();

  const { data: keys, isLoading } = useQuery({ 
    queryKey: ["api-keys"], 
    queryFn: async () => { 
      const res = await fetch("/api/api-keys"); 
      const json = await res.json();
      return json.data || []; 
    } 
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => { 
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" }); 
      if (!res.ok) throw new Error("Failed to revoke key");
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["api-keys"] }); 
      toast.success("API key revoked"); 
    },
    onError: (err: Error) => toast.error(err.message)
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!keys?.length) {
    return (
      <Card className="p-12 text-center flex flex-col items-center gap-4 rounded-2xl border-dashed border-2 border-gray-100 bg-gray-50/30">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
          <Key className="h-6 w-6 text-gray-200" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-gray-900">No API keys found</h3>
          <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
            Generate an API key to start integrating QRise with your own applications and services.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {keys.map((k: any) => (
        <Card key={k.id} className="rounded-xl border-gray-100 shadow-sm overflow-hidden bg-white hover:border-primary/20 transition-all group">
          <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-gray-900">{k.name}</h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                    k.environment === "live" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-amber-100 text-amber-700"
                  )}>
                    {k.environment}
                  </span>
                </div>
                <div className="flex items-center gap-2 lg:hidden">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      if (confirm("Are you sure you want to revoke this key? This action cannot be undone.")) {
                        revokeMutation.mutate(k.id);
                      }
                    }}
                    className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center text-[10px] text-gray-500 font-bold">
                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                  <Shield className="h-3 w-3 text-emerald-600" />
                  <code className="text-[9px] font-mono text-emerald-600">{k.key_prefix}...</code>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(k.created_at), "MMM d, yyyy")}
                </div>
                {k.last_used_at && (
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <Activity className="h-3 w-3" />
                    Used {format(new Date(k.last_used_at), "MMM d, HH:mm")}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {k.scopes?.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[8px] font-black uppercase tracking-wider">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:w-48 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                <span>Usage</span>
                <span className="text-primary">{k.calls_this_month || 0} / {k.monthly_call_limit || '∞'}</span>
              </div>
              <Progress 
                value={k.monthly_call_limit ? (k.calls_this_month / k.monthly_call_limit) * 100 : 0} 
                className="h-1.5 bg-gray-100"
              />
              <p className="text-[8px] text-gray-400 font-medium">
                Resets {format(new Date(k.calls_reset_at || new Date()), "MMM d")}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  navigator.clipboard.writeText(k.key_prefix);
                  toast.success("Prefix copied");
                }}
                className="h-8 w-8 text-gray-300 hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  if (confirm("Are you sure you want to revoke this key? This action cannot be undone and any applications using it will lose access.")) {
                    revokeMutation.mutate(k.id);
                  }
                }}
                className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
