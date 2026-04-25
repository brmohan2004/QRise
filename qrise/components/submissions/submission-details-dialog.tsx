"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Download, 
  Calendar, 
  Hash, 
  Globe, 
  FileText, 
  Signature as SignatureIcon, 
  X, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SubmissionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  formFields: any[];
  formName: string;
  onDownload: (value: string, fileName: string) => void;
  onDelete: (id: string) => void;
}

export function SubmissionDetailsDialog({
  isOpen,
  onClose,
  submission,
  formFields,
  formName,
  onDownload,
  onDelete
}: SubmissionDetailsDialogProps) {
  if (!submission) return null;

  const submissionData = submission.submissionData || {};

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[600px] p-0 border-l border-slate-100 bg-[#FBFDFF] flex flex-col shadow-2xl">
        {/* Immersive Header */}
        <div className="relative h-64 shrink-0 overflow-hidden bg-slate-900">
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500 blur-[80px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[80px]" />
          </div>
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

          <div className="relative z-10 h-full p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Response Detail</p>
                  <SheetTitle className="text-2xl font-black text-white tracking-tight leading-tight">
                    {formName}
                  </SheetTitle>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-6 text-white/40 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  {submission.submittedAt ? format(new Date(submission.submittedAt), "MMM d, HH:mm") : "---"}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  Verified
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  {submission.id.substring(0, 8)}
                </div>
              </div>

              {/* Progress-like visual bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content with Bento Items */}
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Info className="h-3.5 w-3.5" />
               Submission Data
             </h3>
             <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">
               {formFields.length} Fields
             </span>
          </div>

          <div className="grid gap-4">
            <AnimatePresence>
              {formFields.map((field: any, i: number) => {
                const value = submissionData[field.id] || submissionData[field.label] || "---";
                const isAttachment = field.type === 'file' || field.type === 'signature';
                const hasValue = value && value !== "---";

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={cn(
                      "group bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.04)] hover:border-emerald-500/20 transition-all duration-300"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Field {i + 1}</span>
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <ChevronRight className="h-3 w-3 text-emerald-500" />
                           {field.label || field.type}
                        </h4>
                      </div>
                      <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                        {i + 1}
                      </div>
                    </div>

                    {isAttachment && hasValue ? (
                      <div className="mt-2">
                        {field.type === 'signature' ? (
                          <div className="relative group/sig rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 p-2">
                            <img
                              src={value}
                              alt="Signature"
                              className="w-full max-h-[150px] object-contain"
                            />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/sig:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-xl bg-white font-bold gap-2 text-slate-900 hover:scale-105 transition-transform"
                                onClick={() => onDownload(value, `Signature_${submission.id}.png`)}
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-emerald-100 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                <FileText className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{value}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Attachment</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl h-8 px-3 text-[11px] font-black border-slate-200 gap-2 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
                              onClick={() => onDownload(value, value)}
                            >
                              <Download className="h-3 w-3" />
                              SAVE
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 rounded-xl p-3 min-h-[3rem] flex items-center">
                        <p className={cn(
                          "text-base font-bold break-words leading-tight",
                          hasValue ? "text-slate-800" : "text-slate-300 italic"
                        )}>
                          {Array.isArray(value) ? value.join(", ") : value.toString()}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* IP Card */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: formFields.length * 0.05 + 0.1 }}
               className="bg-emerald-50 rounded-[1.5rem] p-5 border border-emerald-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <Globe className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Client Metadata</p>
                   <p className="text-sm font-black text-emerald-900">{submission.ipHash || "Internal Submission"}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 shrink-0 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
          >
            Dismiss
          </Button>
          <Button
            onClick={() => {
              onDelete(submission.id);
              onClose();
            }}
            className="flex-1 h-14 rounded-2xl font-black bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20 border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all text-xs uppercase tracking-widest"
          >
            Delete Permanently
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
