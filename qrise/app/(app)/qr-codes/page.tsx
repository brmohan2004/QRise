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
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My QR Codes</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track your QR codes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsSelectionMode(!isSelectionMode)}
            className={cn(
              "rounded-lg font-medium transition-all",
              isSelectionMode ? "bg-[#0F6E56]/10 text-[#0F6E56] border-[#0F6E56]/20" : "hover:bg-gray-50"
            )}
          >
            {isSelectionMode ? "Cancel Selection" : "Select"}
          </Button>
          <Link 
            href="/create" 
            className="bg-[#0F6E56] hover:bg-[#0d5c48] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create QR
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search QR codes..." 
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 items-center ml-auto">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-[#0F6E56] focus:border-[#0F6E56]"
          >
            <option value="all">All Types</option>
            <option value="url">URL</option>
            <option value="smart">Smart Routing</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-[#0F6E56] focus:border-[#0F6E56]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-[#0F6E56] focus:border-[#0F6E56]"
          >
            <option value="newest">Newest first</option>
            <option value="scans">Most scanned</option>
          </select>
          
          <div className="flex bg-gray-100 rounded-md p-1">
            <button 
              onClick={() => setView("grid")}
              className={`p-1.5 rounded ${view === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setView("list")}
              className={`p-1.5 rounded ${view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
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
