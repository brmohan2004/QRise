"use client";

import { ChevronLeft, Eye, Save, MessageSquare, Share2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FormBuilderHeaderProps {
  onClose: () => void;
  formName: string;
  setFormName: (name: string) => void;
  onPreview: () => void;
  onSave: () => void;
  onShare: () => void;
  isSaving: boolean;
  savedFormId?: string;
}

export function FormBuilderHeader({ 
  onClose, 
  formName, 
  setFormName, 
  onPreview, 
  onSave, 
  onShare,
  isSaving,
  savedFormId,
}: FormBuilderHeaderProps) {
  const { data: usage } = useUsageStats();
  const isLimitReached = !!usage && usage.metrics.forms.limit !== -1 && usage.metrics.forms.current >= usage.metrics.forms.limit && !savedFormId;

  return (
    <header className="h-16 lg:h-18 border-b border-gray-100 bg-white flex items-center justify-between px-4 lg:px-6 shrink-0 z-50 relative shadow-sm">
      <div className="flex items-center gap-2 lg:gap-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
          <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
        </Button>
        <div className="h-6 w-px bg-gray-100 mx-0.5" />
        <Input
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="border-none shadow-none text-sm lg:text-lg font-black tracking-tight p-0 focus-visible:ring-0 w-24 xs:w-32 sm:w-40 lg:w-80 bg-transparent h-10 lg:h-auto text-gray-900"
          placeholder="Form Name"
        />
      </div>
      
      <div className="flex items-center gap-1.5 lg:gap-3">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onPreview} 
          className="h-9 w-9 lg:h-10 lg:w-auto lg:px-4 gap-2 border-gray-100 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all shadow-sm font-black text-[10px] uppercase tracking-widest"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden lg:inline">Preview</span>
        </Button>

        <Button 
          variant="outline" 
          size="icon"
          onClick={onShare}
          disabled={!savedFormId}
          className="h-9 w-9 lg:h-10 lg:w-auto lg:px-4 gap-2 border-gray-100 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all shadow-sm font-black text-[10px] uppercase tracking-widest disabled:opacity-30 disabled:grayscale"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden lg:inline">Share</span>
        </Button>
        
        <Button 
          onClick={onSave} 
          disabled={isSaving || isLimitReached} 
          className={cn(
            "h-9 px-3 lg:h-10 lg:px-6 gap-2 text-white shadow-lg rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
            isLimitReached 
              ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" 
              : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
          )}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="hidden xs:inline">
            {isSaving ? "Saving..." : (isLimitReached ? "Limit Reached" : (savedFormId ? "Update" : "Save"))}
          </span>
        </Button>
      </div>
    </header>
  );
}
