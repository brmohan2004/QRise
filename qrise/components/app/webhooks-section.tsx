import { useState } from "react";
import { Globe, Plus, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EVENTS = [
  { id: "qr.created", label: "QR Created" },
  { id: "qr.updated", label: "QR Updated" },
  { id: "scan.received", label: "Scan Received" },
  { id: "form.submitted", label: "Form Submitted" },
];

export function WebhooksSection() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["scan.received"]);

  const { data: webhooks, isLoading } = useQuery({ 
    queryKey: ["webhooks"], 
    queryFn: async () => { 
      const res = await fetch("/api/webhooks"); 
      const json = await res.json();
      return json.data || json || []; 
    } 
  });

  const createMutation = useMutation({
    mutationFn: async () => { 
      const res = await fetch("/api/webhooks", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ endpointUrl: url, events }) 
      }); 
      if (!res.ok) throw new Error(); 
    },
    onSuccess: () => { 
      setUrl(""); 
      setEvents(["scan.received"]); 
      queryClient.invalidateQueries({ queryKey: ["webhooks"] }); 
      toast.success("Webhook endpoint added"); 
    },
    onError: () => toast.error("Failed to add webhook")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { 
      await fetch(`/api/webhooks/${id}`, { method: "DELETE" }); 
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["webhooks"] }); 
      toast.success("Webhook removed"); 
    },
    onError: () => toast.error("Failed to remove")
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => { 
      await fetch(`/api/webhooks/${id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ isActive: active }) 
      }); 
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["webhooks"] })
  });

  const toggleEvent = (id: string) => setEvents(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Card className="rounded-[2rem] border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Configuration</p>
          <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Add Webhook</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Endpoint URL</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="https://your-api.com/webhooks" 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                className="h-14 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-2xl font-medium" 
              />
              <Button 
                onClick={() => createMutation.mutate()} 
                disabled={!url || createMutation.isPending} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest h-14 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
              >
                {createMutation.isPending ? "Adding..." : "Add Endpoint"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Subscribe to Events</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EVENTS.map(e => (
                <div 
                  key={e.id} 
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group",
                    events.includes(e.id) ? "bg-emerald-50 border-emerald-200" : "bg-white border-gray-100 hover:border-gray-200"
                  )}
                  onClick={() => toggleEvent(e.id)}
                >
                  <Checkbox 
                    id={`event-${e.id}`} 
                    checked={events.includes(e.id)} 
                    onCheckedChange={() => toggleEvent(e.id)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-md" 
                  />
                  <label htmlFor={`event-${e.id}`} className={cn("text-xs font-bold cursor-pointer transition-colors", events.includes(e.id) ? "text-emerald-900" : "text-gray-500")}>
                    {e.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">Configured Endpoints</h3>
          {webhooks?.length > 0 && (
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {webhooks.length} Total
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="md:col-span-2 py-20 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading endpoints...</p>
            </div>
          ) : !webhooks?.length ? (
            <div className="md:col-span-2 py-20 bg-white border border-gray-100 border-dashed rounded-[2.5rem] flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <Globe className="h-8 w-8 text-gray-200" />
              </div>
              <p className="text-sm font-bold text-gray-400">No webhooks configured yet</p>
            </div>
          ) : webhooks.map((hook: any) => (
            <Card key={hook.id} className={cn("rounded-[2.5rem] border-gray-100 shadow-sm transition-all duration-300 group overflow-hidden", !hook.isActive && "opacity-60 bg-gray-50/50")}>
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center shadow-sm transition-all", hook.isActive ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-gray-100 text-gray-400")}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate max-w-[200px] lg:max-w-[300px] mb-1">{hook.endpointUrl}</p>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", hook.isActive ? "bg-emerald-500" : "bg-gray-300")} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {hook.isActive ? "Active" : "Disabled"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Switch 
                    checked={hook.isActive} 
                    onCheckedChange={v => toggleMutation.mutate({ id: hook.id, active: !!v })} 
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {hook.events?.map((e: string) => (
                    <span key={e} className="px-2.5 py-1 bg-white border border-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm group-hover:border-emerald-100 transition-colors">
                      {e}
                    </span>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-300">
                    <ShieldAlert className="h-3 w-3" />
                    Secure Endpoint
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteMutation.mutate(hook.id)}
                    className="h-10 w-10 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}