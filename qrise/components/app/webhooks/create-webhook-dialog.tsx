"use client";

import { useState } from "react";
import { Settings, ShieldCheck, AlertCircle, Info, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WEBHOOK_EVENTS } from "@/lib/webhooks/events";
import { buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

const SecretRevealModal = ({ open, secret, onClose }: { open: boolean; secret: string | null; onClose: () => void }) => {
  const [saved, setSaved] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && saved) onClose(); }}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-[#0F6E56] p-10 text-white relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <DialogTitle className="text-2xl font-black flex items-center gap-4 relative z-10">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            Webhook Secret
          </DialogTitle>
          <DialogDescription className="text-emerald-100/90 mt-2 font-medium opacity-90 relative z-10">
            Copy this signing secret now. You will need it to verify webhooks from QRise.
          </DialogDescription>
        </div>
        <div className="p-8 space-y-6 bg-white">
          <div className="group relative">
            <div className="p-5 bg-gray-900 text-emerald-400 font-mono text-sm rounded-2xl break-all shadow-inner border border-gray-800 leading-relaxed">
              {secret}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-3 top-3 h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const FormContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#0F6E56] p-6 sm:p-10 text-white relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
        <div className="text-xl sm:text-2xl font-black flex items-center gap-4 relative z-10">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/10">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-300" />
          </div>
          Register Webhook
        </div>
        <p className="text-emerald-100/80 mt-1.5 sm:mt-2 text-[10px] sm:text-sm font-medium relative z-10 leading-relaxed">
          Receive real-time notifications about events in your QRise account.
        </p>
      </div>

      <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 bg-white overflow-y-auto custom-scrollbar flex-1">
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
            className="h-11 sm:h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description (Optional)</label>
          <Input
            placeholder="e.g. Production notifications"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="h-11 sm:h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium text-sm"
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Events to subscribe</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {WEBHOOK_EVENTS.map(event => (
              <div
                key={event}
                className={cn(
                  "flex items-center gap-3 p-3.5 sm:p-4 border rounded-2xl transition-all cursor-pointer group",
                  selectedEvents.includes(event)
                    ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200"
                    : "bg-white border-gray-100 hover:border-emerald-100"
                )}
                onClick={() => toggleEvent(event)}
              >
                <Checkbox
                  id={event}
                  checked={selectedEvents.includes(event)}
                  onCheckedChange={() => toggleEvent(event)}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
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
          <CollapsibleContent className="p-4 sm:p-6 bg-gray-50/50 space-y-6">
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
                  <span className="text-[10px] font-bold text-emerald-600">{filterConfig?.["usage.threshold_reached"]?.min_pct || 80}%</span>
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

        <div className="pt-4 pb-2 sm:pb-0">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!url || !url.startsWith("https://") || selectedEvents.length === 0 || createMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest h-12 sm:h-14 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Webhook"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="p-0 h-[92vh] rounded-t-3xl overflow-hidden border-none outline-none">
            <FormContent />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
            <FormContent />
          </DialogContent>
        </Dialog>
      )}
      <SecretRevealModal open={!!showSecret} secret={showSecret} onClose={() => setShowSecret(null)} />
    </>
  );
}
