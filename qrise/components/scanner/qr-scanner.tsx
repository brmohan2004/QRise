"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Maximize, X, ExternalLink, Camera, QrCode, Copy, Check, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function QRScannerOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsCameraReady(false);
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }
      setIsInitializing(true);
      const decodedText = await scannerRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      console.error("Error scanning file", err);
      toast.error("Could not find a valid QR code in the uploaded image.");
    } finally {
      setIsInitializing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }

    if (isOpen && isCameraReady && !scannedResult) {
      startScanner();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen, isCameraReady, scannedResult]);

  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    setIsInitializing(true);
    try {
      // Use a more robust camera selection
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      try {
        // Try back camera first
        await scannerRef.current.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanFailure
        );
      } catch (e) {
        // Fallback to any available camera
        await scannerRef.current.start(
          { facingMode: "user" },
          config,
          onScanSuccess,
          onScanFailure
        );
      }
    } catch (err) {
      console.error("Failed to start scanner", err);
      toast.error("Could not access camera. Please check permissions or ensure you are on a secure (HTTPS) connection.");
      setIsCameraReady(false);
    } finally {
      setIsInitializing(false);
    }
  };

  function onScanSuccess(decodedText: string) {
    setScannedResult(decodedText);
    setIsCameraReady(false);
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
  }

  function onScanFailure(error: any) {
    // Silent
  }

  const isLink = scannedResult?.startsWith("http://") || scannedResult?.startsWith("https://") || (scannedResult && /^(?:[a-z+.-]+):\/\//i.test(scannedResult));

  const handleOpenLink = () => {
    if (scannedResult && isLink) {
      window.open(scannedResult, "_blank");
      closeOverlay();
    }
  };

  const handleCopy = () => {
    if (scannedResult) {
      navigator.clipboard.writeText(scannedResult);
      toast.success("Copied to clipboard");
    }
  };

  const resetScanner = () => {
    setScannedResult(null);
    setIsCameraReady(true);
  };

  const closeOverlay = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
    setIsOpen(false);
    setScannedResult(null);
    setIsCameraReady(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-110 transition-all active:scale-95 group overflow-hidden"
        title="Scan QR/Barcode"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
        <Maximize className="h-6 w-6 relative z-10" />
      </button>

      {/* Scanner Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeOverlay}
          />
          
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <QrCode className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-black tracking-tight dark:text-white">QR Scanner</h2>
              </div>
              <button 
                onClick={closeOverlay}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {!scannedResult ? (
                <div className="space-y-4 relative overflow-hidden rounded-2xl">
                  {/* Scanner container - Always visible to avoid initialization race conditions */}
                  <div 
                    id="reader" 
                    className="overflow-hidden rounded-2xl border-4 border-emerald-500/20 w-full aspect-square bg-black"
                  />
                  
                  {/* Overlay placeholder when not scanning */}
                  {!isCameraReady && (
                    <div className="absolute inset-0 z-10 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in duration-200">
                      <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                        {isInitializing ? (
                          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                        ) : (
                          <Camera className="h-8 w-8 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                          {isInitializing ? "Initializing..." : "Camera Access Required"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-4">
                          {isInitializing ? "Requesting permission from browser" : "Please click the button below to start scanning"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 w-full max-w-[200px]">
                        <button
                          onClick={() => setIsCameraReady(true)}
                          disabled={isInitializing}
                          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {isInitializing ? "Starting..." : "Access Camera"}
                        </button>
                        
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                        />
                        <button
                          onClick={async () => {
                            if (scannerRef.current && scannerRef.current.isScanning) {
                              try {
                                await scannerRef.current.stop();
                              } catch(e) {
                                console.error(e);
                              }
                              setIsCameraReady(false);
                            }
                            fileInputRef.current?.click();
                          }}
                          disabled={isInitializing}
                          className="w-full py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Image
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isCameraReady && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Position the QR code or barcode within the frame to scan
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Scanned Content</p>
                    <p className="text-sm font-medium break-all text-gray-700 dark:text-gray-200">
                      {scannedResult}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={resetScanner}
                      className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                    >
                      Retry
                    </button>
                    {isLink ? (
                      <button
                        onClick={handleOpenLink}
                        className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        Open Link
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleCopy}
                        className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        Copy Text
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer Tip */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                <Camera className="h-3 w-3" />
                <span>Camera access required for live scanning</span>
              </div>
              {isCameraReady && (
                <button
                  onClick={async () => {
                    if (scannerRef.current && scannerRef.current.isScanning) {
                      try {
                        await scannerRef.current.stop();
                      } catch(e) {
                        console.error(e);
                      }
                      setIsCameraReady(false);
                    }
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-tighter transition-colors"
                >
                  <Upload className="h-3 w-3" />
                  <span>Upload Image</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
