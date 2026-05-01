"use client";

import { useState } from "react";
import { Plus, Zap, Info, Settings2, Eye, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CreateTypeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [fieldsSchema, setFieldsSchema] = useState(JSON.stringify({
    type: "object",
    required: ["patient_id"],
    properties: {
      patient_id: { type: "string", title: "Patient ID" }
    }
  }, null, 2));

  const createMutation = useMutation({
    mutationFn: async () => {
      let parsedSchema;
      try {
        parsedSchema = JSON.parse(fieldsSchema);
      } catch (e) {
        throw new Error("Invalid JSON Schema");
      }

      const res = await fetch("/api/v1/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          slug, 
          name, 
          description, 
          icon_url: iconUrl,
          is_public: isPublic,
          fields_schema: parsedSchema
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to create custom type");
      }
      return (await res.json()).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-types"] });
      toast.success("Custom type created successfully");
      onOpenChange(false);
      // Reset
      setSlug("");
      setName("");
      setDescription("");
      setIconUrl("");
      setIsPublic(false);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gray-900 p-10 text-white">
          <DialogTitle className="text-2xl font-black flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-xl text-primary">
              <Zap className="h-6 w-6" />
            </div>
            Create Custom QR Type
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2 font-medium">
            Define a unique QR type with custom data fields and processing logic.
          </DialogDescription>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white">
          <div className="px-10 border-b">
            <TabsList className="h-14 bg-transparent gap-8">
              <TabsTrigger value="basic" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-0 font-black uppercase text-[10px] tracking-widest">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="schema" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-0 font-black uppercase text-[10px] tracking-widest">
                Field Schema
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-0 font-black uppercase text-[10px] tracking-widest">
                Form Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <TabsContent value="basic" className="mt-0 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Type Slug</label>
                  <Input 
                    placeholder="hospital-wristband" 
                    value={slug} 
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                    className="h-12 bg-gray-50 border-gray-100 focus:border-primary focus:ring-primary/20 rounded-xl font-medium" 
                  />
                  <p className="text-[9px] text-gray-400 ml-1">Used in API and short URLs. Must be unique.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Display Name</label>
                  <Input 
                    placeholder="Hospital Wristband" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="h-12 bg-gray-50 border-gray-100 focus:border-primary focus:ring-primary/20 rounded-xl font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description</label>
                <Input 
                  placeholder="e.g. Patient identification and history" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="h-12 bg-gray-50 border-gray-100 focus:border-primary focus:ring-primary/20 rounded-xl font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Icon URL (Optional)</label>
                  <Input 
                    placeholder="https://..." 
                    value={iconUrl} 
                    onChange={e => setIconUrl(e.target.value)} 
                    className="h-12 bg-gray-50 border-gray-100 focus:border-primary focus:ring-primary/20 rounded-xl font-medium" 
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mt-6">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-gray-900">Public Visibility</label>
                    <p className="text-[10px] text-gray-500 font-medium">Show in public marketplace</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schema" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">JSON Schema (Draft-07)</label>
                <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-primary gap-1.5">
                  <Settings2 className="h-3 w-3" />
                  Visual Builder
                </Button>
              </div>
              <div className="relative group">
                <textarea 
                  value={fieldsSchema}
                  onChange={e => setFieldsSchema(e.target.value)}
                  className="w-full h-80 bg-gray-900 text-emerald-400 font-mono text-xs p-6 rounded-2xl border border-gray-800 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  spellCheck={false}
                />
                <div className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Code className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0 space-y-6">
               <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 border-dashed space-y-6">
                  <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    How the QR form will look
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Patient ID</label>
                      <Input disabled className="bg-white border-gray-200" placeholder="Enter value..." />
                    </div>
                    <div className="pt-4">
                      <Button disabled className="w-full bg-primary/20 text-primary-foreground">Create QR</Button>
                    </div>
                  </div>
               </div>
            </TabsContent>
          </div>

          <div className="p-10 border-t flex justify-end gap-4">
            <Button 
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="px-8 h-12 font-black uppercase text-[10px] tracking-widest rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !slug || !name}
              className="px-10 h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/20"
            >
              {createMutation.isPending ? "Creating..." : "Create Type"}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
