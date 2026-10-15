import React from "react";
import Link from "next/link";
import { 
  Barcode, 
  BarChart3, 
  Calendar, 
  ChevronRight, 
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ProjectData {
  id: string;
  name: string;
  industry: string;
  description: string;
  labelsCount: number;
  scansCount: string;
  createdAt: string;
  status: "Active" | "Draft" | "Archived";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

interface ProjectCardProps {
  project: ProjectData;
  onAction?: (action: string, project: ProjectData) => void;
}

export function ProjectCard({ project, onAction }: ProjectCardProps) {
  const Icon = project.icon;

  return (
    <div className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* Left Icon and Title Info */}
        <Link 
          href={`/qrise-matrix/projects/${project.id}`}
          className="flex items-start gap-3.5 min-w-0 flex-1"
        >
          {/* Industry Icon Box */}
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform", project.iconBg, project.iconColor)}>
            <Icon className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {project.name}
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {project.industry}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed">
              {project.description}
            </p>
          </div>
        </Link>

        {/* Right Status Badge & Three Dots Menu */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
              project.status === "Active"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            )}
          >
            {project.status}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800">
              <DropdownMenuItem 
                onClick={() => onAction?.("edit", project)}
                className="rounded-xl text-xs font-semibold cursor-pointer py-2 px-3 gap-2"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onAction?.("duplicate", project)}
                className="rounded-xl text-xs font-semibold cursor-pointer py-2 px-3 gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onAction?.("archive", project)}
                className="rounded-xl text-xs font-semibold cursor-pointer py-2 px-3 gap-2"
              >
                <Archive className="w-3.5 h-3.5 text-slate-500" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem 
                onClick={() => onAction?.("delete", project)}
                className="rounded-xl text-xs font-semibold cursor-pointer py-2 px-3 gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Stats & Creation Date Row */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-slate-500 dark:text-slate-400">
          {/* Labels Count */}
          <div className="flex items-center gap-1.5">
            <Barcode className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">{project.labelsCount}</span>
            <span className="text-[11px] text-slate-400">Labels</span>
          </div>

          {/* Scans Count */}
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-extrabold text-slate-800 dark:text-slate-200">{project.scansCount}</span>
            <span className="text-[11px] text-slate-400">Scans</span>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {project.createdAt} <span className="text-slate-400 hidden sm:inline">Created</span>
            </span>
          </div>
        </div>

        {/* Navigation Chevron */}
        <Link
          href={`/qrise-matrix/projects/${project.id}`}
          className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
          aria-label={`Open ${project.name}`}
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
