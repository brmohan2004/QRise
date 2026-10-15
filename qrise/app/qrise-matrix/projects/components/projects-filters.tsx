"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const PRIMARY_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "Postal & Tracking", label: "Postal & Tracking" },
  { id: "Healthcare & Hospitals", label: "Healthcare" },
  { id: "Retail & Supermarkets", label: "Retail" },
];

const MORE_CATEGORIES = [
  { id: "Logistics, Shipping and Warehousing", label: "Logistics & Warehousing" },
  { id: "Manufacturing & Automotive", label: "Manufacturing & Automotive" },
  { id: "Food, Agriculture and Produce", label: "Food & Agriculture" },
  { id: "Entertainment and Events", label: "Entertainment & Events" },
];

export function ProjectsFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: ProjectsFiltersProps) {
  const isMoreSelected = MORE_CATEGORIES.some((c) => c.id === selectedCategory);

  return (
    <div className="space-y-3">
      {/* Search Bar + Filter Button */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="pl-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm placeholder:text-slate-400 shadow-sm focus-visible:ring-emerald-500"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 shadow-sm"
          title="Filter Options"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {PRIMARY_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0",
                isActive
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              {cat.label}
            </button>
          );
        })}

        {/* More Categories Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 flex items-center justify-center",
                isMoreSelected
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
              title="More Categories"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800">
            {MORE_CATEGORIES.map((cat) => (
              <DropdownMenuItem
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "rounded-xl text-xs font-semibold cursor-pointer py-2 px-3",
                  selectedCategory === cat.id && "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold"
                )}
              >
                {cat.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
