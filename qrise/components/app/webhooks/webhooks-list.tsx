"use client";

import { 
  Trash2, 
  Settings, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Send,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export function WebhooksList() {
  const queryClient = useQueryClient();

  const { data: webhooks, isLoading } = useQuery({ 
    queryKey: ["webhooks"], 
    queryFn: async () => { 
      const res = await fetch("/api/v1/webhooks"); 
      const json = await res.json();
      return json.data?.webhooks || []; 
    } 
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { 
      const res = await fetch(`/api/v1/webhooks/${id}`, { method: "DELETE" }); 
      if (!res.ok) throw new Error("Failed to delete webhook");
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["webhooks"] }); 
      toast.success("Webhook deleted"); 
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

  if (!webhooks?.length) {
    return (
      <Card className="p-12 text-center flex flex-col items-center gap-4 rounded-2xl border-dashed border-2 border-gray-100 bg-gray-50/30">
        <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
          <Activity className="h-8 w-8 text-gray-200" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-gray-900">No webhooks registered</h3>
          <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
            Subscribe to real-time events and process them on your own server.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {webhooks.map((w: any) => (
        <Card key={w.id} className="rounded-xl border-gray-100 shadow-sm overflow-hidden bg-white hover:border-primary/20 transition-all group">
          <div className="p-3 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0",
                    w.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
                  )}>
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-black text-xs sm:text-sm text-gray-900 leading-tight">{w.description || "Untitled Webhook"}</h3>
                    <div className="flex items-center gap-2">
                       <code className="text-[8px] sm:text-[9px] font-mono text-gray-400 max-w-[120px] sm:max-w-[150px] truncate">{w.endpoint_url}</code>
                       {w.is_active ? (
                         <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600 tracking-widest">
                           <CheckCircle2 className="h-2 w-2" /> Active
                         </span>
                       ) : (
                         <span className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-400 tracking-widest">
                           <XCircle className="h-2 w-2" /> Inactive
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {w.events?.map((e: string) => (
                  <span key={e} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[8px] font-black uppercase tracking-wider">
                    {e}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:w-48 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                <span>Deliveries (24h)</span>
                <span className="text-gray-900">{w.delivery_stats?.success_count || 0}/{w.delivery_stats?.total_count || 0}</span>
              </div>
              <div className="flex h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all" 
                  style={{ width: `${(w.delivery_stats?.success_count / (w.delivery_stats?.total_count || 1)) * 100}%` }} 
                />
                <div 
                  className="bg-red-500 h-full transition-all" 
                  style={{ width: `${(w.delivery_stats?.failure_count / (w.delivery_stats?.total_count || 1)) * 100}%` }} 
                />
              </div>
              <p className="text-[8px] text-gray-400 font-medium">
                Last: {w.last_delivery_at ? new Date(w.last_delivery_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Never"}
              </p>
            </div>

            <div className="flex items-center gap-1 ml-auto lg:ml-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-300 hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
              >
                <History className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-primary hover:bg-primary/5 transition-all rounded-lg">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 p-1.5 rounded-xl shadow-xl border-gray-100">
                  <DropdownMenuItem className="h-9 rounded-lg gap-2 font-bold text-[11px] uppercase tracking-wide">
                    <Settings className="h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="h-9 rounded-lg gap-2 font-bold text-[11px] uppercase tracking-wide">
                    <Send className="h-3.5 w-3.5" /> Test Event
                  </DropdownMenuItem>
                  <DropdownMenuItem className="h-9 rounded-lg gap-2 font-bold text-[11px] uppercase tracking-wide">
                    <ShieldCheck className="h-3.5 w-3.5" /> Rotate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem 
                    className="h-9 rounded-lg gap-2 font-bold text-[11px] uppercase tracking-wide text-red-500 focus:bg-red-50 focus:text-red-600"
                    onClick={() => {
                      if (confirm("Delete this webhook?")) {
                        deleteMutation.mutate(w.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
