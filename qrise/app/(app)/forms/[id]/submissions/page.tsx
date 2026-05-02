"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Calendar,
  MessageSquare,
  RefreshCw,
  Loader2,
  BarChart3, 
  Clock, 
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Extracted Components
import { SubmissionsTable } from "@/components/submissions/submissions-table";
import { SubmissionDetailsDialog } from "@/components/submissions/submission-details-dialog";
import { DeleteSubmissionDialog } from "@/components/submissions/delete-submission-dialog";
import { StatCard } from "@/components/app/stat-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FormSubmissionsPage({ params: paramsPromise }: PageProps) {
  const params = use(paramsPromise);
  const id = params.id;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

  const { data: form } = useQuery<any>({
    queryKey: ["form", id],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${id}`);
      const data = await res.json();
      return data;
    }
  });

  const { data: submissions, isLoading, refetch, isRefetching } = useQuery<any[]>({
    queryKey: ["submissions", id],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${id}/submissions`);
      const json = await res.json();
      return json.data || [];
    }
  });

  const handleRefresh = async () => {
    await refetch();
    toast.success("Submissions updated");
  };

  const confirmDelete = (submissionId: string) => {
    setSubmissionToDelete(submissionId);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!submissionToDelete) return;
    
    try {
      const res = await fetch(`/api/submissions/${submissionToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete submission");
      toast.success("Submission deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const openDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setIsDetailsOpen(true);
  };

  const downloadAttachment = (value: string, fileName: string) => {
    if (!value) return;
    const link = document.createElement("a");
    link.href = value;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formFields = form?.fieldsSchema ? (typeof form.fieldsSchema === 'string' ? JSON.parse(form.fieldsSchema) : form.fieldsSchema) : [];
  
  const filteredSubmissions = submissions?.filter(s => {
    const dataString = JSON.stringify(s.submissionData).toLowerCase();
    return dataString.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/forms" className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Back to Library</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
               <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">
                  {form?.name || "Form"} Submissions
                </h1>
              </div>
              <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3" />
                Created {form?.createdAt ? format(new Date(form.createdAt), "MMM d, yyyy") : "---"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
             <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="icon"
                disabled={isRefetching}
                className="h-10 w-10 rounded-xl transition-all border-gray-100 bg-white hover:bg-emerald-50 hover:text-emerald-600 shadow-sm"
             >
                <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
             </Button>
             <Button variant="outline" className="flex-1 sm:flex-none h-10 px-4 font-black text-[10px] uppercase tracking-widest gap-2 rounded-xl border-gray-100 bg-white hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
                <Download className="h-4 w-4" />
                Export CSV
             </Button>
             <Button asChild className="flex-1 sm:flex-none h-10 px-6 font-black text-[10px] uppercase tracking-widest gap-2 rounded-xl bg-gray-900 hover:bg-black text-white transition-all shadow-sm">
                <Link href={`/f/${form?.slug}`} target="_blank">
                  View Live
                </Link>
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <StatCard 
          label="Total Responses" 
          value={submissions?.length || 0} 
          icon={BarChart3} 
          isLoading={isLoading} 
        />
        <StatCard 
          label="Completion Rate" 
          value="84%" 
          prefix=""
          icon={CheckCircle2} 
          isLoading={isLoading} 
        />
        <StatCard 
          label="Avg. Time" 
          value="1m 12s" 
          prefix=""
          icon={Clock} 
          isLoading={isLoading} 
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
             <Input 
                placeholder="Search submissions..." 
                className="pl-9 h-9 rounded-xl border-gray-100 bg-white focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
             SHOWING {filteredSubmissions.length} SUBMISSIONS
           </div>
        </div>

        {isLoading ? (
          <div className="p-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-emerald-600 opacity-20" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-32 text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-100 mb-6" />
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">No submissions found.</p>
            <p className="text-xs text-gray-300 mt-2">Try adjusting your search or share your form to collect responses.</p>
          </div>
        ) : (
          <SubmissionsTable 
            submissions={filteredSubmissions}
            formFields={formFields}
            formSlug={form?.slug}
            onViewDetails={openDetails}
            onDelete={confirmDelete}
            onDownload={downloadAttachment}
          />
        )}
      </div>

      <SubmissionDetailsDialog 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        submission={selectedSubmission}
        formFields={formFields}
        formName={form?.name || "Form"}
        onDownload={downloadAttachment}
        onDelete={confirmDelete}
      />

      <DeleteSubmissionDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}