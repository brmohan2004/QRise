"use client";

import { useState } from "react";
import { Settings, ShieldCheck, AlertCircle, Info, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WEBHOOK_EVENTS } from "@/lib/webhooks/events";
import { buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const SecretRevealModal = ({ open, secret, onClose }: { open: boolean; secret: string | null; onClose: () => void }) => {
  const [saved, setSaved] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && saved) onClose(); }}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary p-10 text-white relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <DialogTitle className="text-2xl font-black flex items-center gap-4 relative z-10">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            Webhook Secret
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/90 mt-2 font-medium opacity-90 relative z-10">
            Copy this signing secret now. You will need it to verify webhooks from QRise.
          </DialogDescription>
        </div>
        <div className="p-8 space-y-6 bg-white">
          <div className="group relative">
            <div className="p-5 bg-gray-900 text-primary font-mono text-sm rounded-2xl break-all shadow-inner border border-gray-800 leading-relaxed">
              {secret}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-3 top-3 h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={() => {
                navigator.clipboard.writeText(secret || "");
                toast.success("Secret copied to clipboard");
              }}
            >
              <ShieldCheck className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest leading-tight">
              Warning: This secret will NOT be shown again.
            </p>
          </div>

          <div className="flex items-center space-x-3 p-1">
            <Checkbox 
              id="saved-confirm" 
              checked={saved} 
              onCheckedChange={(checked) => setSaved(!!checked)}
            />
            <label htmlFor="saved-confirm" className="text-xs font-bold text-gray-600 cursor-pointer">
              I have saved this secret securely
            </label>
          </div>

          <Button 
            onClick={onClose} 
            disabled={!saved}
            className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            I&apos;ve safely copied it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function CreateWebhookDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [filterConfig, setFilterConfig] = useState<any>({});
  const [showSecret, setShowSecret] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          endpoint_url: url, 
          description, 
          events: selectedEvents,
          filter_config: filterConfig
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to create webhook");
      }
      return (await res.json()).data;
    },
    onSuccess: (data) => {
      setShowSecret(data.secret);
      setUrl("");
      setDescription("");
      setSelectedEvents([]);
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev => 
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gray-900 p-10 text-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-4">
              <div className="p-2 bg-primary/20 rounded-xl text-primary">
                <Settings className="h-6 w-6" />
              </div>
              Register Webhook
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2 font-medium">
              Receive real-time notifications about events in your QRise account.
            </DialogDescription>
          </div>

          <div className="p-10 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                Endpoint URL
                {!url.startsWith("https://") && url && (
                  <span className="text-red-500 flex items-center gap-1 font-black text-[8px]">
                    <AlertCircle className="h-2.5 w-2.5" /> HTTPS Required
                  </span>
                )}
              </label>
              <Input 
                placeholder="https://api.yourdomain.com/webhooks" 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                className="h-12 bg-gray-50 border-gray-100 focus:border-primary focus:ring-primary/20 rounded-xl font-medium" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description (Optional)</label>
              <Input 
                placeholder="e.g. Production notifications" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="h-12 bg-gray-50 border-gray-100 focus:border-primary focus:ring-primary/20 rounded-xl font-medium" 
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Events to subscribe</label>
              <div className="grid grid-cols-2 gap-3">
                {WEBHOOK_EVENTS.map(event => (
                  <div 
                    key={event} 
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-2xl transition-all cursor-pointer group",
                      selectedEvents.includes(event) 
                        ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20" 
                        : "bg-white border-gray-100 hover:border-primary/10"
                    )}
                    onClick={() => toggleEvent(event)}
                  >
                    <Checkbox 
                      id={event} 
                      checked={selectedEvents.includes(event)} 
                      onCheckedChange={() => toggleEvent(event)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor={event} className="text-xs font-bold text-gray-700 block cursor-pointer group-hover:text-gray-900">{event}</label>
                  </div>
                ))}
              </div>
            </div>

            <Collapsible className="border border-gray-100 rounded-2xl overflow-hidden">
               <CollapsibleTrigger className={cn(
                 buttonVariants({ variant: "ghost" }),
                 "w-full h-12 flex items-center justify-between px-4 hover:bg-gray-50 transition-colors"
               )}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Advanced Filters</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
               </CollapsibleTrigger>
                <CollapsibleContent className="p-6 bg-gray-50/50 space-y-6">
                  {selectedEvents.includes('qr.scanned') && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-gray-500">QR Scanned Filters</Label>
                      <Input 
                        placeholder="Specific QR IDs (comma separated)"
                        value={filterConfig?.["qr.scanned"]?.qr_ids?.join(", ") || ""}
                        onChange={(e) => {
                          const ids = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                          setFilterConfig((prev: any) => ({
                            ...prev,
                            "qr.scanned": { ...prev["qr.scanned"], qr_ids: ids }
                          }));
                        }}
                        className="h-10 bg-white"
                      />
                    </div>
                  )}

                  {selectedEvents.includes('qr.updated') && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                      <div className="space-y-0.5">
                        <Label className="text-[10px] font-black uppercase text-gray-500">URL Changed Only</Label>
                        <p className="text-[9px] text-gray-400">Only notify when target URL changes</p>
                      </div>
                      <Switch 
                        checked={filterConfig?.["qr.updated"]?.url_changed_only || false}
                        onCheckedChange={(checked) => {
                          setFilterConfig((prev: any) => ({
                            ...prev,
                            "qr.updated": { ...prev["qr.updated"], url_changed_only: checked }
                          }));
                        }}
                      />
                    </div>
                  )}

                  {selectedEvents.includes('form.submission') && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-gray-500">Form Submission Filters</Label>
                      <Input 
                        placeholder="Specific Form IDs (comma separated)"
                        value={filterConfig?.["form.submission"]?.form_ids?.join(", ") || ""}
                        onChange={(e) => {
                          const ids = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                          setFilterConfig((prev: any) => ({
                            ...prev,
                            "form.submission": { ...prev["form.submission"], form_ids: ids }
                          }));
                        }}
                        className="h-10 bg-white"
                      />
                    </div>
                  )}

                  {selectedEvents.includes('usage.threshold_reached') && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase text-gray-500">Threshold Percentage</Label>
                        <span className="text-[10px] font-bold text-primary">{filterConfig?.["usage.threshold_reached"]?.min_pct || 80}%</span>
                      </div>
                      <Slider 
                        defaultValue={[80]}
                        min={50}
                        max={100}
                        step={1}
                        value={[filterConfig?.["usage.threshold_reached"]?.min_pct || 80]}
                        onValueChange={(v: any) => {
                          const val = Array.isArray(v) ? v[0] : v;
                          setFilterConfig((prev: any) => ({
                            ...prev,
                            "usage.threshold_reached": { ...prev["usage.threshold_reached"], min_pct: val }
                          }));
                        }}
                      />
                    </div>
                  )}

                  {selectedEvents.length === 0 && (
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed italic text-center">
                      Select events above to see available filters.
                    </p>
                  )}
                </CollapsibleContent>
            </Collapsible>

            <div className="pt-4">
              <Button 
                onClick={() => createMutation.mutate()} 
                disabled={!url || !url.startsWith("https://") || selectedEvents.length === 0 || createMutation.isPending} 
                className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create Webhook"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <SecretRevealModal open={!!showSecret} secret={showSecret} onClose={() => setShowSecret(null)} />
    </>
  );
}
