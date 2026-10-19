import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProjectInfoStepProps {
  name: string;
  onNameChange: (name: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
}

export function ProjectInfoStep({
  name,
  onNameChange,
  description,
  onDescriptionChange,
}: ProjectInfoStepProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          1. Project Information
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter basic details for your project
        </p>
      </div>

      <div className="space-y-4">
        {/* Project Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Courier Tracking, Product Inventory"
            className="h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500"
            required
          />
        </div>

        {/* Short Description */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Short Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  onDescriptionChange(e.target.value);
                }
              }}
              placeholder="Describe your project, its purpose and use case..."
              className="min-h-[100px] rounded-xl bg-slate-50/50 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus-visible:ring-emerald-500 resize-none pb-7"
            />
            <span className="absolute right-3 bottom-2 text-[10px] font-semibold text-slate-400">
              {description.length}/200
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
