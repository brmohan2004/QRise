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

  const { data: webhooks, isLoading } = useQuery({ queryKey: ["webhooks"], queryFn: async () => { const res = await fetch("/api/webhooks"); return (await res.json()).data || []; } });

  const createMutation = useMutation({
    mutationFn: async () => { const res = await fetch("/api/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpointUrl: url, events }) }); if (!res.ok) throw new Error(); },
    onSuccess: () => { setUrl(""); setEvents(["scan.received"]); queryClient.invalidateQueries({ queryKey: ["webhooks"] }); toast.success("Webhook added"); },
    onError: () => toast.error("Failed to add webhook")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/webhooks/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["webhooks"] }); toast.success("Webhook removed"); },
    onError: () => toast.error("Failed to remove")
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => { await fetch(`/api/webhooks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: active }) }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["webhooks"] })
  });

  const toggleEvent = (id: string) => setEvents(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-slate-200/60 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-black uppercase">Add Webhook</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-xs font-black uppercase text-slate-400">Endpoint URL</label><div className="flex gap-2"><Input placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} className="h-10" /><Button onClick={() => createMutation.mutate()} disabled={!url} className="bg-indigo-600 font-bold h-10 px-4"><Plus className="h-4 w-4 mr-1" />Add</Button></div></div>
          <div className="flex flex-wrap gap-4">{EVENTS.map(e => (<div key={e.id} className="flex items-center gap-2"><Checkbox id={e.id} checked={events.includes(e.id)} onCheckedChange={() => toggleEvent(e.id)} /><label htmlFor={e.id} className="text-sm">{e.label}</label></div>))}</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? <div className="md:col-span-2 py-12 text-center text-slate-400">Loading...</div> : !webhooks?.length ? <div className="md:col-span-2 py-12 border-2 border-dashed rounded-3xl text-center text-slate-400">No webhooks configured</div> : webhooks.map((hook: any) => (
          <Card key={hook.id} className={cn("rounded-3xl border-slate-200/40 shadow-sm", !hook.isActive && "opacity-60")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center", hook.isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400")}><Globe className="h-4 w-4" /></div>
                  <div className="min-w-0"><p className="text-sm font-bold truncate max-w-[180px]">{hook.endpointUrl}</p></div>
                </div>
                <Switch checked={hook.isActive} onCheckedChange={v => toggleMutation.mutate({ id: hook.id, active: !!v })} />
              </div>
              <div className="flex flex-wrap gap-1 mb-3">{hook.events?.map((e: string) => (<span key={e} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">{e}</span>))}</div>
              <div className="pt-3 border-t border-slate-50 flex justify-end"><Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(hook.id)}><Trash2 className="h-4 w-4" /></Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}