"use client";

import { useState, useEffect } from "react";
import { Trash2, Key, Calendar, Activity, ExternalLink, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";

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
      setRevokeId(null);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

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

    const safeFormat = (dateStr: string | null | undefined, formatStr: string) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, formatStr);
    };

    return (
    <div className="space-y-3">
      {keys.map((k: any) => (
        <Card key={k.id} className="rounded-xl border-gray-100 shadow-sm overflow-hidden bg-white hover:border-primary/20 transition-all group">
          <div className="p-3 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xs sm:text-sm text-gray-900">{k.name}</h3>
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
                    onClick={() => setRevokeId(k.id)}
                    className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 items-center text-[9px] sm:text-[10px] text-gray-500 font-bold">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                  <Shield className="h-2.5 w-2.5 sm:h-3 sm:h-3 text-emerald-600" />
                  <code className="text-[8px] sm:text-[9px] font-mono text-emerald-600">{k.keyPrefix}...</code>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:h-3" />
                  {safeFormat(k.createdAt, "MMM d, yyyy")}
                </div>
                {k.lastUsedAt && (
                  <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-600">
                    <Activity className="h-2.5 w-2.5 sm:h-3 sm:h-3" />
                    Used {safeFormat(k.lastUsedAt, "MMM d, HH:mm")}
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
                <span className="text-primary">{k.callsThisMonth || 0} / {k.monthlyCallLimit || '∞'}</span>
              </div>
              <Progress 
                value={k.monthlyCallLimit ? (k.callsThisMonth / k.monthlyCallLimit) * 100 : 0} 
                className="h-1.5 bg-gray-100"
              />
              <p className="text-[8px] text-gray-400 font-medium">
                Resets {safeFormat(k.callsResetAt, "MMM d")}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  navigator.clipboard.writeText(k.keyPrefix);
                  setIsCopied(k.id);
                  toast.success("Key prefix copied to clipboard");
                  setTimeout(() => setIsCopied(null), 2000);
                }}
                className={cn(
                  "h-8 w-8 transition-all rounded-lg",
                  isCopied === k.id ? "text-emerald-500 bg-emerald-50" : "text-gray-300 hover:text-primary hover:bg-primary/5"
                )}
              >
                {isCopied === k.id ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setRevokeId(k.id)}
                className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
      <RevokeConfirmDialog 
        isOpen={!!revokeId} 
        onClose={() => setRevokeId(null)} 
        onConfirm={() => revokeId && revokeMutation.mutate(revokeId)}
        isPending={revokeMutation.isPending}
      />
    </div>
  );
}

function RevokeConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  isPending 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  isPending: boolean;
}) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, countdown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-rose-50 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Revoke API Key?</DialogTitle>
              <DialogDescription className="text-xs font-bold text-gray-500 leading-relaxed max-w-[280px]">
                This action is permanent. Any applications using this key will immediately lose access to the QRise API.
              </DialogDescription>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-12 rounded-2xl border-gray-100 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={countdown > 0 || isPending}
              className={cn(
                "h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                countdown > 0 && "bg-rose-950 text-rose-500 border border-rose-900/30"
              )}
            >
              {isPending ? "Revoking..." : (countdown > 0 ? `Wait (${countdown}s)` : "Confirm Revoke")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
