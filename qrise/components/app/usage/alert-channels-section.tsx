"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Hash, Mail, Plus, Trash2, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AlertChannelsSection() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [type, setType] = useState<"slack" | "discord" | "email">("slack");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [email, setEmail] = useState("");
  const [threshold, setThreshold] = useState(80);

  const { data: channels, isLoading } = useQuery({
    queryKey: ["usage-alerts"],
    queryFn: async () => {
      const res = await fetch("/api/v1/usage/alerts");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return (await res.json()).data.channels;
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/usage/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_type: type,
          webhook_url: type === "email" ? undefined : webhookUrl,
          email: type === "email" ? email : undefined,
          threshold_pct: threshold
        })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usage-alerts"] });
      setIsAddOpen(false);
      setWebhookUrl("");
      setEmail("");
      toast.success("Alert channel added");
    },
    onError: () => toast.error("Failed to add channel")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/usage/alerts/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usage-alerts"] });
      toast.success("Channel removed");
    }
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/usage/alerts/${id}/test`, { method: "POST" });
      if (!res.ok) throw new Error();
      return await res.json();
    },
    onSuccess: () => toast.success("Test notification sent"),
    onError: () => toast.error("Failed to send test")
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "slack": return <MessageSquare className="h-4 w-4" />;
      case "discord": return <Hash className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Notification Channels</h3>
          <p className="text-xs text-gray-500 font-medium">Get alerted before you hit your monthly limits.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button variant="outline" className="h-10 rounded-xl border-gray-200 font-black text-[10px] uppercase tracking-widest">
              <Plus className="h-3.5 w-3.5 mr-2" />
              Add Channel
            </Button>
          } />
          <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Add Alert Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Channel Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-100 rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    <SelectItem value="slack" className="font-bold">Slack Webhook</SelectItem>
                    <SelectItem value="discord" className="font-bold">Discord Webhook</SelectItem>
                    <SelectItem value="email" className="font-bold">Email Address</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "email" ? (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email Address</Label>
                  <Input 
                    placeholder="alerts@company.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-100 rounded-xl font-medium"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Webhook URL</Label>
                  <Input 
                    placeholder="https://hooks.slack.com/services/..." 
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-100 rounded-xl font-medium"
                  />
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Threshold Percentage</Label>
                  <span className="text-xs font-black text-primary">{threshold}%</span>
                </div>
                <Slider 
                  defaultValue={[80]} 
                  max={100} 
                  min={50} 
                  step={5} 
                  onValueChange={(v: any) => setThreshold(Array.isArray(v) ? v[0] : v)}
                />
                <p className="text-[10px] text-gray-400 font-bold italic">Notification will be sent when your monthly usage reaches this point.</p>
              </div>

              <Button 
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || (type === "email" ? !email : !webhookUrl)}
                className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 mt-4"
              >
                Create Alert Channel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-3xl" />)
        ) : channels?.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <AlertTriangle className="h-8 w-8 text-gray-200 mb-3" />
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No alert channels configured</p>
          </div>
        ) : (
          channels?.map((channel: any) => (
            <Card key={channel.id} className="rounded-3xl border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {getIcon(channel.channelType)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        {channel.channelType} · {channel.thresholdPct}% Threshold
                      </p>
                      <p className="text-xs font-black text-gray-900 truncate max-w-[180px]">
                        {channel.channelType === "email" ? channel.email : (channel.webhookUrl?.slice(0, 30) + "...")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => testMutation.mutate(channel.id)}
                      disabled={testMutation.isPending}
                      className="h-8 w-8 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-lg"
                    >
                      <Send className={cn("h-3.5 w-3.5", testMutation.isPending && "animate-pulse")} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteMutation.mutate(channel.id)}
                      className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
