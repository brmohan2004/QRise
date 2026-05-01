"use client";

import { useState } from "react";
import { 
  Monitor, 
  Smartphone, 
  CreditCard, 
  Layout, 
  Copy, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Palette,
  Maximize
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EmbedPreviewProps {
  id: string;
  name: string;
}

export function EmbedPreview({ id, name }: EmbedPreviewProps) {
  const [style, setStyle] = useState<"card" | "minimal" | "badge" | "floating">("card");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [showScanCount, setShowScanCount] = useState(false);
  const [showName, setShowName] = useState(true);

  const embedUrl = `/embed/qr/${id}?style=${style}&theme=${theme}&size=${size}&show_name=${showName}&show_scan_count=${showScanCount}`;
  
  const snippets = {
    html: `<div class="qrise-embed" data-id="${id}" data-style="${style}" data-theme="${theme}" data-size="${size}"></div>\n<script src="https://app.qrise.app/embed/embed.js" async></script>`,
    iframe: `<iframe src="https://app.qrise.app/embed/qr/${id}?style=${style}&theme=${theme}&size=${size}" width="100%" height="400" frameborder="0"></iframe>`,
    react: `import { QRiseEmbed } from '@qrise/react';\n\n<QRiseEmbed \n  id="${id}" \n  style="${style}" \n  theme="${theme}" \n  size="${size}" \n/>`
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code snippet copied to clipboard");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Embed Style</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "card", label: "Full Card", icon: CreditCard },
                { id: "minimal", label: "Minimal", icon: Layout },
                { id: "badge", label: "Badge", icon: ShieldCheck },
                { id: "floating", label: "Floating", icon: Monitor },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all",
                    style === s.id 
                      ? "bg-primary/5 border-primary ring-1 ring-primary/20" 
                      : "bg-white border-gray-100 hover:border-primary/20"
                  )}
                >
                  <s.icon className={cn("h-6 w-6", style === s.id ? "text-primary" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", style === s.id ? "text-primary" : "text-gray-500")}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Theme</label>
                <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                  {["light", "dark", "auto"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t as any)}
                      className={cn(
                        "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                        theme === t ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Size</label>
                <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                  {["sm", "md", "lg"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s as any)}
                      className={cn(
                        "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                        size === s ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-900">Show QR Name</p>
                <p className="text-[10px] text-gray-500 font-medium">Display the QR label on the embed</p>
              </div>
              <Switch checked={showName} onCheckedChange={setShowName} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-900">Live Scan Count</p>
                <p className="text-[10px] text-gray-500 font-medium">Show real-time scan statistics</p>
              </div>
              <Switch checked={showScanCount} onCheckedChange={setShowScanCount} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Export Image</label>
          <div className="flex flex-wrap gap-2">
            {["PNG", "SVG", "WebP"].map((format) => (
              <Button 
                key={format}
                variant="outline" 
                size="sm"
                className="h-10 px-6 rounded-xl border-gray-100 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all"
                onClick={() => {
                   window.open(`/api/v1/qr/${id}/image?format=${format.toLowerCase()}&size=1024`, '_blank');
                   toast.success(`Downloading ${format} image...`);
                }}
              >
                <Download className="h-3.5 w-3.5 mr-2" />
                {format}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Live Preview</label>
          <div className={cn(
            "relative rounded-[2.5rem] border overflow-hidden shadow-xl min-h-[400px] flex items-center justify-center bg-gray-50 pattern-grid",
            theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"
          )}>
            <div className="absolute top-4 left-4 flex gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-red-400/20" />
               <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20" />
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/20" />
            </div>
            <iframe 
              src={embedUrl} 
              className="w-full h-[400px] border-none"
              title="QR Embed Preview"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="html" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-gray-50 p-1 rounded-xl h-10">
                <TabsTrigger value="html" className="text-[9px] font-black uppercase tracking-widest rounded-lg h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">HTML</TabsTrigger>
                <TabsTrigger value="iframe" className="text-[9px] font-black uppercase tracking-widest rounded-lg h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">iFrame</TabsTrigger>
                <TabsTrigger value="react" className="text-[9px] font-black uppercase tracking-widest rounded-lg h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">React</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="html" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="relative group">
                <pre className="p-6 bg-gray-900 text-emerald-400 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-gray-800 shadow-inner">
                  {snippets.html}
                </pre>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-4 right-4 h-8 w-8 text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(snippets.html)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="iframe" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="relative group">
                <pre className="p-6 bg-gray-900 text-emerald-400 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-gray-800 shadow-inner">
                  {snippets.iframe}
                </pre>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-4 right-4 h-8 w-8 text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(snippets.iframe)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="react" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="relative group">
                <pre className="p-6 bg-gray-900 text-emerald-400 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-gray-800 shadow-inner">
                  {snippets.react}
                </pre>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-4 right-4 h-8 w-8 text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(snippets.react)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
