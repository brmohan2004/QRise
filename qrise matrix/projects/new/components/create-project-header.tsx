"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateProjectHeader() {
  return (
    <div className="flex items-center justify-between pb-1">
      <div className="flex items-center gap-3">
        <Link href="/qrise-matrix/projects">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <button
        type="button"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Project Guide & Help"
        aria-label="Help"
      >
        <HelpCircle className="w-5 h-5 stroke-[1.8]" />
      </button>
    </div>
  );
}
