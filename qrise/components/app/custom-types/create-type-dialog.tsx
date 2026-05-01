"use client";

import { useState } from "react";
import { Plus, Zap, Info, Settings2, Eye, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const FormContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[#0F6E56] p-6 sm:p-10 text-white relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
        <div className="text-xl sm:text-2xl font-black flex items-center gap-4 relative z-10">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md border border-white/10">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-300" />
          </div>
          Create Custom QR Type
        </div>
        <p className="text-emerald-100/80 mt-1.5 sm:mt-2 text-[10px] sm:text-sm font-medium relative z-10 leading-relaxed">
          Define a unique QR type with custom data fields and processing logic.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white flex-1 flex flex-col overflow-hidden">
        <div className="px-6 sm:px-10 border-b shrink-0">
          <TabsList className="h-12 sm:h-14 bg-transparent gap-4 sm:gap-8">
            <TabsTrigger value="basic" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald-600 border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none h-full px-0 font-black uppercase text-[9px] sm:text-[10px] tracking-widest">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="schema" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald-600 border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none h-full px-0 font-black uppercase text-[9px] sm:text-[10px] tracking-widest">
              Field Schema
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald-600 border-b-2 border-transparent data-[state=active]:border-emerald-600 rounded-none h-full px-0 font-black uppercase text-[9px] sm:text-[10px] tracking-widest">
              Form Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
          <TabsContent value="basic" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Type Slug</label>
                <Input 
                  placeholder="hospital-wristband" 
                  value={slug} 
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                  className="h-11 sm:h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium text-sm" 
                />
                <p className="text-[8px] sm:text-[9px] text-gray-400 ml-1">Used in API and short URLs. Must be unique.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Display Name</label>
                <Input 
                  placeholder="Hospital Wristband" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="h-11 sm:h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium text-sm" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description</label>
              <Input 
                placeholder="e.g. Patient identification and history" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="h-11 sm:h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium text-sm" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Icon URL (Optional)</label>
                <Input 
                  placeholder="https://..." 
                  value={iconUrl} 
                  onChange={e => setIconUrl(e.target.value)} 
                  className="h-11 sm:h-12 bg-gray-50 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl font-medium text-sm" 
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 sm:mt-6">
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
              <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-emerald-600 gap-1.5">
                <Settings2 className="h-3 w-3" />
                Visual Builder
              </Button>
            </div>
            <div className="relative group">
              <textarea 
                value={fieldsSchema}
                onChange={e => setFieldsSchema(e.target.value)}
                className="w-full h-80 bg-gray-900 text-emerald-400 font-mono text-xs p-6 rounded-2xl border border-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                spellCheck={false}
              />
              <div className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Code className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0 space-y-6">
             <div className="p-6 sm:p-8 bg-gray-50 rounded-3xl border border-gray-100 border-dashed space-y-6">
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
                    <Button disabled className="w-full bg-emerald-600/20 text-emerald-600">Create QR</Button>
                  </div>
                </div>
             </div>
          </TabsContent>
        </div>

        <div className="p-6 sm:p-10 border-t flex justify-end gap-3 sm:gap-4 shrink-0 bg-white">
          <Button 
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="px-6 sm:px-8 h-11 sm:h-12 font-black uppercase text-[10px] tracking-widest rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !slug || !name}
            className="px-8 sm:px-10 h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-emerald-600/20"
          >
            {createMutation.isPending ? "Creating..." : "Create Type"}
          </Button>
        </div>
      </Tabs>
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
          <DialogContent className="sm:max-w-5xl sm:max-h-[90vh] sm:h-fit rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col">
            <FormContent />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
