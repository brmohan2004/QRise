"use client";

import { useState, useEffect } from "react";
import { 
  Settings2, 
  Link2, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Layout,
  Plus,
  Code2,
  Eye,
  Trash2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResolverConfig {
  resolver_url: string;
  timeout_ms: number;
  fallback_url?: string;
  fallback_html?: string;
  retry_on_fail: boolean;
}

interface Template {
  id: string;
  slug: string;
  name: string;
  template_html: string;
  is_default: boolean;
}

export function ResolverConfigDialog({ 
  open, 
  onOpenChange,
  typeSlug,
  initialConfig,
  fieldsSchema
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  typeSlug: string;
  initialConfig?: ResolverConfig;
  fieldsSchema?: any;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [url, setUrl] = useState(initialConfig?.resolver_url || "");
  const [timeout, setTimeoutVal] = useState(initialConfig?.timeout_ms || 3000);
  const [fallbackUrl, setFallbackUrl] = useState(initialConfig?.fallback_url || "");
  const [fallbackHtml, setFallbackHtml] = useState(initialConfig?.fallback_html || "");
  const [retryOnFail, setRetryOnFail] = useState(initialConfig?.retry_on_fail ?? true);
  const [testResult, setTestResult] = useState<any>(null);
  
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["templates", typeSlug],
    queryFn: async () => {
      const res = await fetch(`/api/v1/types/${typeSlug}/templates`);
      const data = await res.json();
      return data.data?.templates || [];
    },
    enabled: open
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/types/${typeSlug}/resolver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resolver_url: url,
          timeout_ms: timeout,
          fallback_url: fallbackUrl,
          fallback_html: fallbackHtml,
          retry_on_fail: retryOnFail
        }),
      });
      if (!res.ok) throw new Error("Failed to save resolver config");
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-types"] });
      toast.success("Configuration updated");
      onOpenChange(false);
    }
  });

  const templateMutation = useMutation({
    mutationFn: async (tpl: Partial<Template>) => {
      const isNew = !tpl.id;
      const res = await fetch(`/api/v1/types/${typeSlug}/templates${isNew ? '' : `/${tpl.id}`}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tpl),
      });
      if (!res.ok) throw new Error("Failed to save template");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", typeSlug] });
      toast.success("Template saved");
      setEditingTemplate(null);
    }
  });

  const previewMutation = useMutation({
    mutationFn: async (html: string) => {
      const res = await fetch(`/api/v1/types/${typeSlug}/resolver/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scan_context: { is_test: true },
          mock_template: html 
        }),
      });
      const data = await res.json();
      setPreviewHtml(data.data?.rendered_html || "Preview failed");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[85vh]">
        <div className="bg-gray-900 p-8 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black flex items-center gap-4">
                <div className="p-2 bg-primary/20 rounded-xl text-primary">
                  <Settings2 className="h-6 w-6" />
                </div>
                {typeSlug} Resolver
              </DialogTitle>
              <DialogDescription className="text-gray-400 mt-1 font-medium">
                Configure resolution logic and HTML templates.
              </DialogDescription>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-white/10 p-1 rounded-xl">
                <TabsTrigger value="general" className="rounded-lg h-8 px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary">Config</TabsTrigger>
                <TabsTrigger value="templates" className="rounded-lg h-8 px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary">Templates</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
          {activeTab === "general" ? (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Resolver Endpoint</label>
                  <Input 
                    placeholder="https://api.yourdomain.com/resolver" 
                    value={url} 
                    onChange={e => setUrl(e.target.value)} 
                    className="h-12 bg-gray-50 border-gray-100 rounded-xl font-medium" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Timeout ({timeout}ms)</label>
                    <Slider value={[timeout]} onValueChange={v => setTimeoutVal(Array.isArray(v) ? v[0] : v)} min={100} max={5000} step={100} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-gray-900">Retry</label>
                      <p className="text-[9px] text-gray-500 font-medium">On network fail</p>
                    </div>
                    <Switch checked={retryOnFail} onCheckedChange={setRetryOnFail} />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button 
                  onClick={() => saveMutation.mutate()} 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest rounded-xl"
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {editingTemplate ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">
                      {editingTemplate.id ? 'Edit Template' : 'New Template'}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingTemplate(null); setPreviewHtml(null); }}>Cancel</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Template Name" value={editingTemplate.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} className="h-10 bg-gray-50 border-gray-100 rounded-lg text-xs" />
                    <Input placeholder="Slug" value={editingTemplate.slug} onChange={e => setEditingTemplate({...editingTemplate, slug: e.target.value})} className="h-10 bg-gray-50 border-gray-100 rounded-lg text-xs" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 h-[400px]">
                    <div className="col-span-2 flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">HTML Content</label>
                        <Button size="sm" variant="ghost" className="h-6 text-[9px] font-black uppercase text-primary" onClick={() => previewMutation.mutate(editingTemplate.template_html || "")}>
                          <Eye className="h-3 w-3 mr-1" /> Preview
                        </Button>
                      </div>
                      <textarea 
                        className="flex-1 bg-gray-900 text-emerald-400 p-4 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        value={editingTemplate.template_html}
                        onChange={e => setEditingTemplate({...editingTemplate, template_html: e.target.value})}
                        spellCheck={false}
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 overflow-y-auto">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">Variables</label>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-bold text-gray-900 uppercase tracking-widest mb-2">Scan Context</p>
                          {['device_type', 'os', 'country', 'language', 'timestamp'].map(v => (
                            <code key={v} className="block text-[10px] text-gray-500 mb-1">{"{{"} scan_context.{v} {"}}"}</code>
                          ))}
                        </div>
                        {fieldsSchema && (
                          <div>
                            <p className="text-[9px] font-bold text-gray-900 uppercase tracking-widest mb-2">Data Fields</p>
                            {Object.keys(fieldsSchema.properties || {}).map(v => (
                              <code key={v} className="block text-[10px] text-primary mb-1">{"{{"} {v} {"}}"}</code>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {previewHtml && (
                    <div className="border-2 border-dashed border-gray-100 rounded-2xl p-4 animate-in zoom-in-95">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Preview</p>
                      <div className="bg-white rounded-lg p-0 border shadow-sm max-h-[400px] overflow-hidden aspect-[16/9]">
                        <iframe 
                          srcDoc={previewHtml} 
                          title="Template Preview"
                          className="w-full h-full border-none"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-primary text-white font-black uppercase text-xs h-12 rounded-xl"
                    onClick={() => templateMutation.mutate(editingTemplate)}
                    disabled={templateMutation.isPending || !editingTemplate.name || !editingTemplate.slug}
                  >
                    Save Template
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Available Templates</h3>
                    <Button size="sm" onClick={() => setEditingTemplate({ name: "", slug: "", template_html: "<h1>Hello {{ scan_context.country }}</h1>", is_default: false })} className="gap-2 rounded-lg h-8 text-[10px] font-black uppercase">
                      <Plus className="h-3 w-3" /> Add Template
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    {templates.map((tpl: Template) => (
                      <div key={tpl.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Code2 className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">{tpl.name}</span>
                              {tpl.is_default && <span className="bg-primary/10 text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Default</span>}
                            </div>
                            <code className="text-[10px] text-gray-400 font-mono">@{tpl.slug}</code>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => setEditingTemplate(tpl)} className="h-8 w-8 text-gray-400 hover:text-primary"><Layout className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                    {templates.length === 0 && !templatesLoading && (
                      <div className="py-12 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 text-xs font-medium">No templates created yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
