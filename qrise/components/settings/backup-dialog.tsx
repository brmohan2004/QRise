"use client";

import { useState } from "react";
import { X, Database, FileJson, FileArchive, Loader2, Download, AlertCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export function BackupDialog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isExportingQR, setIsExportingQR] = useState(false);
  const [isExportingForms, setIsExportingForms] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const isOpen = searchParams.get("backup") === "true";

  const handleExport = async (type: "qr-codes" | "form-submissions") => {
    const setLoader = type === "qr-codes" ? setIsExportingQR : setIsExportingForms;
    setLoader(true);
    setExportProgress(10);
    
    try {
      setExportProgress(30);
      const res = await fetch(`/api/export?type=${type}`);
      setExportProgress(80);
      
      if (!res.ok) throw new Error("Export failed");
      
      // Convert response to blob and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === "qr-codes" ? "qrise-qr-export.zip" : "qrise-forms-export.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportProgress(100);
      setTimeout(() => {
        setLoader(false);
        toast.success("Export complete! Your download has started.");
      }, 500);

    } catch (err) {
      toast.error("Failed to process export request");
      setLoader(false);
    }
  };

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("backup");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-4xl md:w-[90vw] md:h-[80vh] h-[85vh] w-[95vw] p-0 overflow-hidden rounded-[32px] md:rounded-[48px] border-none shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Database className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 leading-none">Data Sovereignty</h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 md:mt-1.5">Manage your workspace data</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900 group"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-50 custom-scrollbar">
          <div className="space-y-16">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-1.5 h-5 md:h-6 bg-emerald-600 rounded-full" />
              <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Universal Export Hub</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* QR Export */}
              <div className="group p-8 md:p-10 bg-white border border-slate-100 rounded-[32px] md:rounded-[48px] hover:border-emerald-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between h-auto min-h-[340px] md:h-[400px] relative overflow-hidden">
                <div className="space-y-6 md:space-y-8 relative z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Database className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Universal QR Export</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                      Download a complete archive of your QR codes. Includes metadata in CSV format and high-resolution PNG assets in a ZIP file.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  {isExportingQR && (
                    <div className="space-y-1.5 md:space-y-2 px-1">
                      <div className="flex justify-between text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                        <span>Preparing ZIP...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="h-1.5 md:h-2 bg-emerald-50" />
                    </div>
                  )}
                  <Button 
                    onClick={() => handleExport("qr-codes")} 
                    disabled={isExportingQR || isExportingForms} 
                    className="w-full bg-slate-900 hover:bg-black font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] h-14 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isExportingQR ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4" />}
                    Generate Archive
                  </Button>
                </div>
              </div>

              {/* Forms Export */}
              <div className="group p-8 md:p-10 bg-white border border-slate-100 rounded-[32px] md:rounded-[48px] hover:border-emerald-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between h-auto min-h-[340px] md:h-[400px] relative overflow-hidden">
                <div className="space-y-6 md:space-y-8 relative z-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <FileJson className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Form Response Ledger</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                      Export every submission received through your live forms. Formatted as a clean CSV table for direct import into Excel or BI tools.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  {isExportingForms && (
                    <div className="space-y-1.5 md:space-y-2 px-1">
                      <div className="flex justify-between text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                        <span>Generating CSV...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="h-1.5 md:h-2 bg-emerald-50" />
                    </div>
                  )}
                  <Button 
                    onClick={() => handleExport("form-submissions")} 
                    disabled={isExportingQR || isExportingForms} 
                    className="w-full bg-slate-900 hover:bg-black font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] h-14 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isExportingForms ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export Submissions
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 bg-slate-50 rounded-[32px] md:rounded-[48px] border border-slate-100 flex gap-6 md:gap-8 items-center">
               <AlertCircle className="h-8 w-8 md:h-10 md:w-10 text-slate-300 shrink-0" />
               <div className="space-y-1 md:space-y-2">
                 <p className="text-[9px] md:text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em] mb-1">Large Datasets Note</p>
                 <p className="text-[11px] md:text-xs text-slate-500 font-medium leading-relaxed">Exports containing more than 10,000 records or 500 assets are processed in the background. You&apos;ll receive a secure link via email once your download is ready.</p>
               </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
