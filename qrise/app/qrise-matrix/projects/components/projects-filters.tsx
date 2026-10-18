"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProjectsFilters({
  searchQuery,
  onSearchChange,
}: ProjectsFiltersProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search projects..."
        className="pl-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm placeholder:text-slate-400 shadow-xs focus-visible:ring-emerald-500"
      />
    </div>
  );
}
