"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Package, 
  MoreHorizontal, 
  Edit, 
  Share2, 
  Archive, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceHeaderProps {
  title?: string;
  industry?: string;
  description?: string;
  status?: string;
}

export function WorkspaceHeader({
  title = "Courier Tracking",
  industry = "Postal & Tracking",
  description = "Track shipments, deliveries and parcel movements.",
  status = "Active",
}: WorkspaceHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 pb-1">
      {/* Left Back Arrow + Project Identity */}
      <div className="flex items-start gap-3 min-w-0">
        <Link href="/qrise-matrix/projects" className="mt-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        {/* Project Icon Box */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/60 dark:border-emerald-800/60">
          <Package className="w-6 h-6 stroke-[1.8]" />
        </div>

        {/* Project Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
              {status}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {industry}
          </p>
        </div>
      </div>

      {/* Right Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 outline-none mt-1"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800">
          <DropdownMenuItem className="rounded-xl text-xs font-semibold cursor-pointer py-2 px-3 gap-2">
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl text-xs font-semibold cursor-pointer py-2 px-3 gap-2">
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            Share Project
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl text-xs font-semibold cursor-pointer py-2 px-3 gap-2">
            <Archive className="w-3.5 h-3.5 text-slate-500" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem className="rounded-xl text-xs font-semibold cursor-pointer py-2 px-3 gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40">
            <Trash2 className="w-3.5 h-3.5" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
