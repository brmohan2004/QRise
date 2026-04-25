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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Extracted Components
import { SubmissionsTable } from "@/components/submissions/submissions-table";
import { SubmissionDetailsDialog } from "@/components/submissions/submission-details-dialog";
import { DeleteSubmissionDialog } from "@/components/submissions/delete-submission-dialog";

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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        <Link 
          href="/forms" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-[#0F6E56] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Form Studio
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#0F6E56] rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
               <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {form?.name || "Form"} Submissions
              </h1>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                Created {form?.createdAt ? format(new Date(form.createdAt), "MMMM d, yyyy") : "---"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="icon"
                disabled={isRefetching}
                className="rounded-lg transition-all border-gray-200"
             >
                <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
             </Button>
             <Button variant="outline" className="font-medium gap-2 rounded-lg transition-all border-gray-200">
                <Download className="h-4 w-4" />
                Export CSV
             </Button>
             <Button asChild className="font-medium bg-[#0F6E56] hover:bg-[#0d5c48] text-white rounded-lg px-4 py-2 transition-colors shadow-sm">
                <Link href={`/f/${form?.slug}`} target="_blank">
                  View Live Form
                </Link>
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Responses</CardDescription>
            <CardTitle className="text-3xl font-bold text-[#0F6E56]">{submissions?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xl border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completion Rate</CardDescription>
            <CardTitle className="text-3xl font-bold text-[#0F6E56]">84%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xl border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Time</CardDescription>
            <CardTitle className="text-3xl font-bold text-[#0F6E56]">1m 12s</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <Input 
                placeholder="Search submissions..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <div className="text-xs font-semibold text-gray-400">
             SHOWING {filteredSubmissions.length} SUBMISSIONS
           </div>
        </div>

        {isLoading ? (
          <div className="p-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#0F6E56] opacity-20" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-32 text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-100 mb-6" />
            <p className="text-lg font-bold text-gray-400">No submissions found.</p>
            <p className="text-sm text-gray-300">Try adjusting your search or share your form to collect responses.</p>
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