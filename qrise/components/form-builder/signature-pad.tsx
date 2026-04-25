"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, Signature } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
}

export function SignaturePad({ isOpen, onClose, onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      const setupCanvas = () => {
        const parent = canvas.parentElement;
        if (parent && ctx) {
          const dpr = window.devicePixelRatio || 1;
          const width = parent.clientWidth;
          const height = 300;
          
          // Set display size
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          
          // Set internal resolution
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          
          // Scale context
          ctx.scale(dpr, dpr);
          
          // Reset context properties
          ctx.strokeStyle = "#0F6E56";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
        }
      };

      // Small delay to wait for animation to finish
      const timer = setTimeout(setupCanvas, 200);
      window.addEventListener("resize", setupCanvas);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", setupCanvas);
      };
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setIsEmpty(false);
    
    // Set starting point
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        let clientX, clientY;
        if ("touches" in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
        }
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.beginPath();
        setIsEmpty(true);
      }
    }
  };

  const handleSave = () => {
    if (isEmpty || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 border-none rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-white">
        <DialogHeader className="bg-[#0F6E56] p-8 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Signature className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Draw Your Signature</DialogTitle>
              <DialogDescription className="text-white/70">
                Please sign within the box below.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 h-[300px] overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full"
            />
            {isEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                <Signature className="h-12 w-12 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sign Here</span>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={clear}
              className="flex-1 h-12 rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
            <Button
              onClick={handleSave}
              disabled={isEmpty}
              className="flex-[2] h-12 rounded-xl gap-2 bg-[#0F6E56] hover:bg-[#0d5c48] text-white shadow-lg shadow-[#0F6E56]/20 font-bold"
            >
              <Check className="h-4 w-4" />
              Upload Signature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
