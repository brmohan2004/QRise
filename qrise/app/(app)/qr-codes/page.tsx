"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Search, LayoutGrid, List as ListIcon, Loader2, Plus, Trash2, CheckSquare, Square, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QrCard } from "@/components/qr/qr-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function QrCodesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      const res = await fetch(`/api/qr/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
      toast.success("QR Code status updated");
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/qr", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to delete selected QR codes");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
      toast.success(`${selectedIds.length} QR codes deleted`);
      setSelectedIds([]);
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
    if (selectedIds.length === qrs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(qrs.map((qr: any) => qr.id));
    }
  };

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchQRs = async ({ pageParam }: { pageParam?: string }) => {
    const params = new URLSearchParams();
    if (pageParam) params.set("cursor", pageParam);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    params.set("sort", sortBy);
    
    const res = await fetch(`/api/qr?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch QR codes");
    const data = await res.json();
    
    return {
      items: data.items || [],
      nextCursor: data.nextCursor
    };
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['qrcodes', debouncedSearch, statusFilter, typeFilter, sortBy],
    queryFn: fetchQRs,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });

  const rawQrs = data?.pages.flatMap(p => p.items) || [];
  
  // Group QRs by bulkJobId
  const qrs = rawQrs.reduce((acc: any[], qr: any) => {
    if (qr.bulkJobId) {
      const existingJob = acc.find(item => item.isBulk && item.bulkJobId === qr.bulkJobId);
      if (existingJob) {
        existingJob.items.push(qr);
        existingJob.scanCount = (existingJob.scanCount || 0) + (qr.scanCount || 0);
      } else {
        acc.push({
          ...qr,
          isBulk: true,
          bulkJobId: qr.bulkJobId,
          items: [qr],
          scanCount: qr.scanCount || 0
        });
      }
    } else {
      acc.push(qr);
    }
    return acc;
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">My QR Codes</h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Manage and track your QR performance.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsSelectionMode(!isSelectionMode)}
            className={cn(
              "hidden sm:flex rounded-xl font-black text-[9px] uppercase tracking-widest transition-all h-9 px-4 border-gray-100 shadow-sm",
              isSelectionMode ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
            )}
          >
            {isSelectionMode ? "Cancel" : "Select"}
          </Button>
          <Link 
            href="/create" 
            className="flex-1 sm:flex-none h-10 bg-gray-900 hover:bg-black text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create QR
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input 
                placeholder="Search..." 
                className="pl-8 h-8 bg-white border-gray-100 rounded-xl text-[11px] font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className={cn(
                "md:hidden rounded-xl font-black text-[9px] uppercase tracking-widest transition-all h-8 px-3 gap-1.5 shadow-sm border-gray-100",
                isSelectionMode 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : "bg-white text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
              )}
            >
              {isSelectionMode ? <X className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
              {isSelectionMode ? "Cancel" : "Select"}
            </Button>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-1.5 items-center">
            <div className="flex-1 sm:flex-none">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full sm:w-auto h-8 bg-white border border-gray-100 rounded-xl px-2.5 text-[9px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none cursor-pointer shadow-sm"
              >
                <option value="all">Types</option>
                <option value="url">URL</option>
                <option value="smart">Smart</option>
              </select>
            </div>

            <div className="flex-1 sm:flex-none">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto h-8 bg-white border border-gray-100 rounded-xl px-2.5 text-[9px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none cursor-pointer shadow-sm"
              >
                <option value="all">Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="flex-1 sm:flex-none">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto h-8 bg-white border border-gray-100 rounded-xl px-2.5 text-[9px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none cursor-pointer shadow-sm"
              >
                <option value="newest">Newest</option>
                <option value="scans">Scans</option>
              </select>
            </div>
            
            <div className="flex bg-gray-50 border border-gray-100 rounded-xl p-0.5 shadow-sm ml-auto sm:ml-0">
              <button 
                onClick={() => setView("grid")}
                className={cn(
                  "p-1 rounded-lg transition-all",
                  view === "grid" ? "bg-white shadow-sm text-emerald-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setView("list")}
                className={cn(
                  "p-1 rounded-lg transition-all",
                  view === "list" ? "bg-white shadow-sm text-emerald-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[320px] rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse" />
          ))}
        </div>
      ) : qrs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't created any QR codes yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first dynamic QR code to start tracking scans and engaging your audience.
          </p>
          <Link 
            href="/create" 
            className="inline-flex items-center gap-2 bg-[#0F6E56] hover:bg-[#0d5c48] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Create your first QR
          </Link>
        </div>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {qrs.map((qr: any) => (
            <QrCard 
              key={qr.id} 
              qr={qr} 
              view={view} 
              onToggleStatus={(id, isActive) => toggleStatusMutation.mutate({ id, isActive })}
              isSelected={selectedIds.includes(qr.id)}
              onSelect={handleSelect}
              selectionMode={isSelectionMode || selectedIds.length > 0}
            />
          ))}
        </div>
      )}
      
      {hasNextPage && (
        <div className="mt-8 text-center pb-20">
          <button 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Load more"}
          </button>
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
                {selectedIds.length === qrs.length ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                {selectedIds.length === qrs.length ? "Deselect All" : "Select All"}
              </button>

              <button 
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedIds.length} QR codes?`)) {
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
