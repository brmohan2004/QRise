"use client";

import { ChevronLeft, Eye, Save, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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
  savedFormId 
}: FormBuilderHeaderProps) {
  return (
    <header className="h-14 lg:h-16 border-b bg-white flex items-center justify-between px-4 lg:px-6 shrink-0 z-50 relative shadow-sm">
      <div className="flex items-center gap-3 lg:gap-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11 lg:h-10 lg:w-10 rounded-xl hover:bg-slate-100">
          <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
        </Button>
        <div className="h-5 lg:h-6 w-px bg-slate-200" />
        <Input
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="border-none shadow-none text-base lg:text-lg font-bold p-0 focus-visible:ring-0 w-40 lg:w-64 bg-transparent h-11 lg:h-auto"
        />
      </div>
      
      <div className="flex items-center gap-2 lg:gap-3">
        {savedFormId && (
          <>
            <Button 
              variant="ghost" 
              asChild
              className="hidden sm:flex gap-2 text-slate-500 hover:text-[#0F6E56] hover:bg-[#0F6E56]/5 px-3 lg:px-4 rounded-xl"
            >
              <Link href={`/forms/${savedFormId}/submissions`}>
                <MessageSquare className="h-4 w-4" />
                <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">Submissions</span>
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={onShare}
              className="hidden sm:flex gap-2 text-slate-500 hover:text-[#0F6E56] hover:bg-[#0F6E56]/5 px-3 lg:px-4 rounded-xl"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">Share</span>
            </Button>
          </>
        )}
        
        <Button 
          variant="outline" 
          onClick={onPreview} 
          className="h-11 lg:h-10 px-3 lg:px-4 gap-2 border-slate-200 hover:border-[#0F6E56]/30 hover:bg-[#0F6E56]/5 rounded-xl transition-all"
        >
          <Eye className="h-4 w-4 text-slate-500" />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-slate-600">Preview</span>
        </Button>
        
        <Button 
          onClick={onSave} 
          disabled={isSaving} 
          className="h-11 lg:h-10 px-4 lg:px-6 gap-2 bg-[#0F6E56] hover:bg-[#0d5c48] text-white shadow-lg shadow-[#0F6E56]/20 rounded-xl transition-all"
        >
          <Save className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isSaving ? "Saving..." : (savedFormId ? "Update Form" : "Save Form")}
          </span>
        </Button>
      </div>
    </header>
  );
}
