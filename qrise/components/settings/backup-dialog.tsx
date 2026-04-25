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
      const res = await fetch(`/api/export?type=${type}`);
      if (!res.ok) throw new Error("Export failed");
      
      let progress = 10;
      const interval = setInterval(() => {
        progress += 15;
        setExportProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setLoader(false);
          toast.success("Export complete! Check your email for the download link.");
        }
      }, 800);

    } catch (err) {
      toast.error("Failed to start export job");
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
      <DialogContent showCloseButton={false} className="sm:max-w-4xl md:w-[90vw] md:h-[80vh] h-screen w-screen p-0 overflow-hidden rounded-none md:rounded-[40px] border-none shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 bg-white border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 italic uppercase">Data Sovereignty</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage your workspace data</p>
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
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Universal Export Hub</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* QR Export */}
              <div className="group p-8 bg-white border border-slate-200/60 rounded-[40px] hover:border-indigo-300 transition-all flex flex-col justify-between h-[360px] shadow-sm">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Database className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 italic">Universal QR Export</h3>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                      Download a complete archive of your QR codes. Includes metadata in CSV format and high-resolution PNG assets in a ZIP file.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {isExportingQR && (
                    <div className="space-y-1.5 px-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        <span>Preparing ZIP Archive...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="h-1.5" />
                    </div>
                  )}
                  <Button 
                    onClick={() => handleExport("qr-codes")} 
                    disabled={isExportingQR || isExportingForms} 
                    className="w-full bg-slate-900 hover:bg-black font-black uppercase tracking-widest text-xs h-14 rounded-2xl flex items-center justify-center gap-2"
                  >
                    {isExportingQR ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4" />}
                    Generate Archive
                  </Button>
                </div>
              </div>

              {/* Forms Export */}
              <div className="group p-8 bg-white border border-slate-200/60 rounded-[40px] hover:border-emerald-300 transition-all flex flex-col justify-between h-[360px] shadow-sm">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileJson className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 italic text-emerald-900">Form Response Ledger</h3>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                      Export every submission received through your live forms. Formatted as a clean CSV table for direct import into Excel or BI tools.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {isExportingForms && (
                    <div className="space-y-1.5 px-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <span>Generating CSV...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="h-1.5 bg-emerald-100" />
                    </div>
                  )}
                  <Button 
                    onClick={() => handleExport("form-submissions")} 
                    disabled={isExportingQR || isExportingForms} 
                    className="w-full bg-slate-900 hover:bg-black font-black uppercase tracking-widest text-xs h-14 rounded-2xl flex items-center justify-center gap-2"
                  >
                    {isExportingForms ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export Submissions
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-100/50 rounded-[40px] border border-slate-100 flex gap-6 items-center">
               <AlertCircle className="h-8 w-8 text-slate-400 shrink-0" />
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Large Datasets Note</p>
                 <p className="text-xs text-slate-500 font-bold leading-relaxed">Exports containing more than 10,000 records or 500 assets are processed in the background. You'll receive a secure link via email once your download is ready.</p>
               </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
