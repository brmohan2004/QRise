"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  FileText, 
  MoreVertical, 
  Edit2, 
  Eye, 
  Trash2, 
  ExternalLink,
  Search,
  MessageSquare,
  Calendar,
  Save,
  Copy,
  QrCode,
  X,
  LayoutGrid,
  List as ListIcon,
  Square,
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { FormBuilder } from "@/components/form-builder";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormCard } from "@/components/forms/form-card";

export default function FormsClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: forms, isLoading } = useQuery({
    queryKey: ["forms", statusFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("sort", sortBy);
      
      const res = await fetch(`/api/forms?${params.toString()}`);
      const json = await res.json();
      return json.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete form");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form deleted successfully");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form status updated");
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/forms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to delete selected forms");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success(`${selectedIds.length} forms deleted`);
      setSelectedIds([]);
      setIsSelectionMode(false);
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredForms?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredForms?.map((f: any) => f.id) || []);
    }
  };

  const filteredForms = forms?.filter((f: any) => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    router.push("/forms/create");
  };

  const handleDuplicate = async (form: any) => {
    const newName = `${form.name} (Copy)`;
    const response = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        fields: form.fields || [],
        settings: form.settings || {},
      }),
    });

    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Form duplicated successfully");
    } else {
      toast.error("Failed to duplicate form");
    }
  };

  const handleShare = async (form: any) => {
    const shareUrl = `${window.location.origin}/f/${form.slug}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Form link copied to clipboard");
  };

  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleEdit = (form: any) => {
    router.push(`/forms/${form.id}`);
  };



  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">Form Studio</h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Create, manage, and analyze your lead capture forms.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden sm:flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Auto-save</span>
            <Switch 
              checked={autoSaveEnabled} 
              onCheckedChange={setAutoSaveEnabled}
              className="scale-75 data-[state=checked]:bg-emerald-600"
            />
          </div>

          <Button 
            onClick={handleCreateNew} 
            className="flex-1 sm:flex-none bg-gray-900 hover:bg-gray-800 text-white h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input 
              placeholder="Search forms..." 
              className="pl-8 h-8 rounded-xl border-gray-100 bg-white focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-[11px] font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSelectionMode(!isSelectionMode)}
            className={cn(
              "h-8 px-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all gap-1.5 border-gray-100 shadow-sm",
              isSelectionMode 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-white text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
            )}
          >
            {isSelectionMode ? <X className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
            <span className="hidden sm:inline">{isSelectionMode ? "Cancel" : "Select"}</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2.5 text-[9px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2.5 text-[9px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
            >
              <option value="newest">Newest first</option>
              <option value="submissions">Most submissions</option>
            </select>
          </div>

          <div className="flex items-center gap-0.5 p-0.5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm ml-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1 rounded-lg transition-all",
                viewMode === "grid" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1 rounded-lg transition-all",
                viewMode === "list" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredForms?.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start collecting data by creating your first dynamic form.
          </p>
          <Button onClick={handleCreateNew} className="bg-[#0F6E56] hover:bg-[#0d5c48] text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
            Create Form
          </Button>
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredForms.map((form: any) => (
            <FormCard 
              key={form.id} 
              form={form} 
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutateAsync(id)}
              onDuplicate={handleDuplicate}
              onShare={handleShare}
              onToggleStatus={(id: string, isActive: boolean) => toggleStatusMutation.mutate({ id, isActive })}
              isSelected={selectedIds.includes(form.id)}
              onSelect={handleSelect}
              selectionMode={isSelectionMode || selectedIds.length > 0}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-gray-800 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-gray-700">
              <div className="bg-[#0F6E56] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {selectedIds.length}
              </div>
              <span className="text-sm font-medium">Selected</span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm font-medium hover:text-emerald-400 transition-colors"
              >
                {selectedIds.length === filteredForms?.length ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                {selectedIds.length === filteredForms?.length ? "Deselect All" : "Select All"}
              </button>

              <button 
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedIds.length} forms?`)) {
                    bulkDeleteMutation.mutate(selectedIds);
                  }
                }}
                disabled={bulkDeleteMutation.isPending}
                className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {bulkDeleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>

              <button 
                onClick={() => {
                  setSelectedIds([]);
                  setIsSelectionMode(false);
                }}
                className="p-1 hover:bg-gray-800 rounded-full transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
