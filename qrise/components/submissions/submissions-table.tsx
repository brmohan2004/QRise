"use client";

import { format } from "date-fns";
import { User, FileText, Signature as SignatureIcon, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmissionsTableProps {
  submissions: Record<string, unknown>[];
  formFields: Record<string, unknown>[];
  formSlug?: string;
  onViewDetails: (submission: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onDownload: (value: string, fileName: string) => void;
}

export function SubmissionsTable({ 
  submissions, 
  formFields, 
  formSlug: _formSlug,
  onViewDetails, 
  onDelete,
  onDownload 
}: SubmissionsTableProps) {
  const fieldLabels = formFields.map((f: Record<string, any>) => (f.label as string) || (f.type as string));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
            <th className="px-6 py-5 border-b min-w-[200px]">Submission Info</th>
            {fieldLabels.map((label: string, i: number) => (
              <th key={i} className="px-6 py-5 border-b min-w-[150px]">{label}</th>
            ))}
            <th className="px-6 py-5 border-b text-right min-w-[150px]">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y border-t bg-white">
          {submissions.map((s: any) => {
            const data = (s.submissionData || {}) as Record<string, unknown>;
            return (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-[#0F6E56]/10 group-hover:text-[#0F6E56] group-hover:border-[#0F6E56]/20 transition-all duration-300">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 leading-none">
                          {format(new Date(s.submittedAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        ID: {s.ipHash?.substring(0, 8) || "0.0.0.0"}
                      </p>
                    </div>
                  </div>
                </td>
                
                {formFields.map((field: any) => {
                  const value = data[field.id] || data[field.label] || "---";
                  const isFile = field.type === 'file';
                  const isSignature = field.type === 'signature';

                  if ((isFile || isSignature) && value && value !== "---") {
                    let ext = isSignature ? 'png' : 'file';
                    if (isFile && typeof value === 'string' && value.includes('.')) {
                      ext = value.split('.').pop() || 'file';
                    }

                    return (
                      <td key={field.id} className="px-6 py-5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-2 rounded-lg text-xs border-slate-200 hover:text-[#0F6E56] hover:border-[#0F6E56]/30 hover:bg-[#0F6E56]/5 transition-all"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onClick={() => onDownload(value as string, `${(field as any).label || 'attachment'}_${(s as any).id}.${ext}`)}
                        >
                          {isFile ? <FileText className="h-3 w-3" /> : <SignatureIcon className="h-3 w-3" />}
                          Download
                        </Button>
                      </td>
                    );
                  }

                  return (
                    <td key={field.id} className="px-6 py-5">
                      <span className="text-sm font-medium text-slate-600 truncate max-w-[200px] block">
                        {Array.isArray(value) ? value.join(", ") : value.toString()}
                      </span>
                    </td>
                  );
                })}

                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                       <Button 
                         onClick={() => onViewDetails(s)}
                         variant="ghost" 
                         size="icon" 
                         className="h-9 w-9 rounded-xl hover:bg-[#0F6E56]/10 hover:text-[#0F6E56] transition-all border border-transparent hover:border-[#0F6E56]/20"
                         title="View Details"
                       >
                         <Eye className="h-4 w-4" />
                       </Button>
                       <Button 
                         onClick={() => onDelete(s.id)}
                         variant="ghost" 
                         size="icon" 
                         className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                         title="Delete Submission"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
