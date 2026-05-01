"use client";

import { Zap, MoreVertical, Edit, ShieldCheck, Globe, Trash2, Activity, Settings2, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export function TypesGrid() {
  const queryClient = useQueryClient();

  const { data: types, isLoading } = useQuery({ 
    queryKey: ["custom-types"], 
    queryFn: async () => { 
      const res = await fetch("/api/v1/types?scope=mine"); 
      const json = await res.json();
      return json.data?.types || []; 
    } 
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => { 
      const res = await fetch(`/api/v1/types/${slug}`, { method: "DELETE" }); 
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to delete type");
      }
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["custom-types"] }); 
      toast.success("Custom type deleted"); 
    },
    onError: (err: Error) => toast.error(err.message)
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!types?.length) {
    return (
      <Card className="p-12 text-center flex flex-col items-center gap-4 rounded-2xl border-dashed border-2 border-gray-100 bg-gray-50/30">
        <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
          <Zap className="h-8 w-8 text-gray-200" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-gray-900">Define your first QR Type</h3>
          <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
            Create custom data structures and hook them up to your own logic.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {types.map((type: any) => (
        <Card key={type.id} className="rounded-xl border-gray-100 shadow-sm overflow-hidden bg-white hover:border-primary/20 transition-all group flex flex-col">
          <div className="p-5 space-y-4 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shrink-0">
                   {type.icon_url ? (
                     <img src={type.icon_url} alt="" className="w-6 h-6 object-contain" />
                   ) : (
                     <Zap className="h-5 w-5 text-primary" />
                   )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-xs text-gray-900 leading-tight">{type.name}</h3>
                    {type.is_verified && <ShieldCheck className="h-3 w-3 text-emerald-500" />}
                  </div>
                  <code className="text-[9px] font-mono text-gray-400">/{type.slug}</code>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl shadow-xl border-gray-100">
                  <DropdownMenuItem className="h-9 rounded-lg gap-2 font-bold text-[11px] uppercase tracking-wide">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="h-9 rounded-lg gap-2 font-bold text-[11px] uppercase tracking-wide">
                    <Settings2 className="h-3.5 w-3.5" /> Config
                  </DropdownMenuItem>
                  <DropdownMenuItem className="h-9 rounded-lg gap-2 font-bold text-[11px] uppercase tracking-wide">
                    <Activity className="h-3.5 w-3.5" /> Analytics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem className="h-9 rounded-lg gap-2 font-bold text-[11px] uppercase tracking-wide text-primary">
                    <ShoppingCart className="h-3.5 w-3.5" /> Marketplace
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem 
                    className="h-9 rounded-lg gap-2 font-bold text-[11px] uppercase tracking-wide text-red-500 focus:bg-red-50 focus:text-red-600"
                    onClick={() => {
                      if (confirm("Delete this custom type?")) {
                        deleteMutation.mutate(type.slug);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-[11px] text-gray-500 font-medium line-clamp-2 leading-relaxed">
              {type.description || "No description provided."}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                 <span className="text-sm font-black text-gray-900 leading-none">{type.qr_count || 0}</span>
                 <span className="text-[8px] font-black uppercase text-gray-400 mt-1 tracking-widest">QRs</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                 <span className="text-sm font-black text-gray-900 leading-none">{type.scan_count || 0}</span>
                 <span className="text-[8px] font-black uppercase text-gray-400 mt-1 tracking-widest">Scans</span>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {type.is_public ? (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[8px] font-black uppercase tracking-wider">
                  <Globe className="h-2.5 w-2.5" />
                  Public
                </div>
              ) : (
                <div className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded-md text-[8px] font-black uppercase tracking-wider">
                  Private
                </div>
              )}
            </div>
            {type.is_verified && (
               <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">Verified</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
