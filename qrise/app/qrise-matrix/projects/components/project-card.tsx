import React from "react";
import Link from "next/link";
import { MoreVertical, Edit, Copy, Archive, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ProjectData {
  id: string;
  name: string;
  industry: string;
  description: string;
  labelsCount: number;
  scansCount: string;
  createdAt: string;
  status: "Active" | "Draft" | "Archived";
  icon?: React.ElementType;
  iconBg?: string;
  iconColor?: string;
}

interface ProjectCardProps {
  project: ProjectData;
  onAction?: (action: string, project: ProjectData) => void;
}

export function ProjectCard({ project, onAction }: ProjectCardProps) {
  return (
    <div className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* Clickable Area: Name, Description, and Date */}
        <Link 
          href={`/qrise-matrix/projects/${project.id}`}
          className="min-w-0 flex-1 block"
        >
          {/* Project Name */}
          <h2 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {project.name}
          </h2>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed">
            {project.description || project.industry}
          </p>

          {/* Date of Creation (Simple bottom line) */}
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2.5">
            Created on {project.createdAt}
          </p>
        </Link>

        {/* Minimal 3-dots Menu */}
        <div className="shrink-0 -mt-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none cursor-pointer"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800">
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
    </div>
  );
}
