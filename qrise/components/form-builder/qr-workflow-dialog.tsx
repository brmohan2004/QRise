"use client";

import { Check, Link, Settings, Palette as PaletteIcon, QrCode } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QRWorkflowDialogProps {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  step: number;
  setStep: (step: number) => void;
  savedFormId?: string;
}

export function QRWorkflowDialog({ isOpen, onClose, step, setStep, savedFormId }: QRWorkflowDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 border-none rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-[#0F6E56] p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">How to Create Custom QRs</h2>
          <p className="text-white/70">A step-by-step guide to professional QR codes.</p>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-10">
            {[
              { id: 1, name: "Selection", desc: "Choose Type" },
              { id: 2, name: "Config", desc: "Link Data" },
              { id: 3, name: "Design", desc: "Styling" },
            ].map((s, index) => (
              <div key={s.id} className="flex flex-col items-center flex-1 relative">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10",
                  step === s.id 
                    ? "bg-[#0F6E56] text-white ring-4 ring-[#0F6E56]/20" 
                    : step > s.id 
                      ? "bg-green-500 text-white" 
                      : "bg-slate-100 text-slate-400"
                )}>
                  {step > s.id ? <Check className="h-5 w-5" /> : s.id}
                </div>
                <div className="mt-3 text-center">
                  <p className={cn("text-xs font-bold uppercase tracking-wider", step >= s.id ? "text-[#0F6E56]" : "text-slate-400")}>
                    {s.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{s.desc}</p>
                </div>
                {index < 2 && (
                  <div className="absolute top-5 left-[50%] w-full h-[2px] bg-slate-100 -z-0" />
                )}
              </div>
            ))}
          </div>

          <div className="min-h-[240px]">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Link className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Step 1: Choose Your QR Type</h3>
                    <p className="text-sm text-slate-500">Select the behavior that fits your form.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-800">Dynamic URL</p>
                    <p className="text-xs text-slate-400 mt-1">Tracks scans and analytics.</p>
                  </div>
                  <div className="p-4 rounded-2xl border bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-800">Smart Routing</p>
                    <p className="text-xs text-slate-400 mt-1">Redirect based on device or OS.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Step 2: Link Your Form</h3>
                    <p className="text-sm text-slate-500">Connect your form URL to the QR code.</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Form URL: https://qrise.io/f/{savedFormId || '...' }
                  </div>
                  <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[80%]" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <PaletteIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Step 3: Design & Branding</h3>
                    <p className="text-sm text-slate-500">Make your QR code stand out.</p>
                  </div>
                </div>
                <div className="flex justify-center gap-6 p-4">
                  <div className="w-24 h-24 rounded-xl border-2 border-slate-200 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0F6E56]" />
                    <span className="text-[10px] font-bold text-slate-400">Colors</span>
                  </div>
                  <div className="w-24 h-24 rounded-xl border-2 border-slate-200 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-200 border-2 border-[#0F6E56]" />
                    <span className="text-[10px] font-bold text-slate-400">Frames</span>
                  </div>
                  <div className="w-24 h-24 rounded-xl border-2 border-slate-200 flex flex-col items-center justify-center gap-2">
                    <QrCode className="h-8 w-8 text-[#0F6E56]" />
                    <span className="text-[10px] font-bold text-slate-400">Logos</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  onClose(false);
                }
              }}
              className="text-slate-500"
            >
              {step === 1 ? "Close" : "Back"}
            </Button>
            <Button
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  onClose(false);
                  toast.success("Ready to create your custom QR!");
                }
              }}
              className="bg-[#0F6E56] hover:bg-[#0d5c48] px-8"
            >
              {step === 3 ? "Finish Guide" : "Next Step"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
