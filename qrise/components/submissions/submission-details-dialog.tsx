"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Download, 
  Hash, 
  Globe, 
  FileText, 
  Clock, 
  ShieldCheck,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SubmissionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Record<string, any>;
  formFields: Record<string, any>[];
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
      <SheetContent className="w-full sm:max-w-[500px] p-0 border-l border-gray-100 bg-white flex flex-col shadow-2xl overflow-hidden">
        {/* Modern Light Header */}
        <div className="relative shrink-0 border-b border-gray-50 bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Response Detail</p>
                  <SheetTitle className="text-xl font-black text-gray-900 tracking-tight leading-tight mt-0.5">
                    {formName}
                  </SheetTitle>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
                <Clock className="h-3 w-3 text-emerald-500" />
                {submission.submittedAt ? format(new Date(submission.submittedAt), "MMM d, HH:mm") : "---"}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Verified
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
                <Hash className="h-3 w-3 text-gray-300" />
                {submission.id.substring(0, 8)}
              </div>
            </div>
          </div>
          
          <div className="h-[2px] w-full bg-gray-50 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-emerald-500"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-6">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Info className="h-3.5 w-3.5" />
               Submission Data
             </h3>
             <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">
               {formFields.length} Fields
             </span>
          </div>

          <div className="grid gap-3">
            <AnimatePresence>
              {formFields.map((field: Record<string, any>, i: number) => {
                const value = submissionData[field.id] || submissionData[field.label] || "---";
                const isAttachment = field.type === 'file' || field.type === 'signature';
                const hasValue = value && value !== "---";

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-emerald-500/30 transition-all duration-300"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-0.5">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           {field.label || field.type}
                        </h4>
                      </div>
                    </div>

                    {isAttachment && hasValue ? (
                      <div className="mt-2">
                        {field.type === 'signature' ? (
                          <div className="relative group/sig rounded-xl overflow-hidden bg-gray-50 border border-gray-100 p-2">
                            <img
                              src={value}
                              alt="Signature"
                              className="w-full max-h-[120px] object-contain"
                            />
                            <div className="absolute inset-0 bg-white/80 opacity-0 group-hover/sig:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-xl bg-white font-black text-[10px] uppercase tracking-widest gap-2 text-gray-900 border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm"
                                onClick={() => onDownload(value, `Signature_${submission.id}.png`)}
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group-hover:border-emerald-100 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                <FileText className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{value}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Attachment</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 rounded-lg text-[9px] font-black border-gray-200 bg-white gap-2 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                              onClick={() => onDownload(value, value)}
                            >
                              <Download className="h-3 w-3" />
                              SAVE
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50/50 rounded-xl p-3 min-h-[2.5rem] flex items-center border border-transparent group-hover:border-emerald-50 transition-all">
                        <p className={cn(
                          "text-sm font-bold break-words leading-tight",
                          hasValue ? "text-gray-700" : "text-gray-300 italic font-medium"
                        )}>
                          {Array.isArray(value) ? value.join(", ") : value.toString()}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: formFields.length * 0.03 + 0.1 }}
               className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-emerald-100 shadow-sm">
                  <Globe className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">Client Metadata</p>
                   <p className="text-xs font-black text-emerald-900 mt-0.5">{submission.ipHash || "Internal Submission"}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Refined Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-50 shrink-0 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl font-black text-gray-400 border-gray-100 hover:bg-gray-50 hover:text-gray-600 transition-all text-[10px] uppercase tracking-widest shadow-sm"
          >
            Dismiss
          </Button>
          <Button
            onClick={() => {
              onDelete(submission.id);
              onClose();
            }}
            className="flex-1 h-11 rounded-xl font-black bg-gray-900 hover:bg-black text-white transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200"
          >
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
