"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import QRCodeStyling from "qr-code-styling";
import { Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QRDesign } from "@/types/qr.types";

interface QRPreviewProps {
  data: string;
  options?: Partial<QRDesign>;
  size?: number;
  className?: string;
  downloadName?: string;
  hideDownload?: boolean;
}

export interface QRPreviewHandle {
  download: (name?: string) => Promise<void>;
}

const defaultOptions: QRDesign = {
  dotColor: "#000000",
  bgColor: "#ffffff",
  dotStyle: "square",
  frameStyle: "none",
};

export const QRPreview = forwardRef<QRPreviewHandle, QRPreviewProps>(({ 
  data, 
  options = {}, 
  size = 200, 
  className, 
  downloadName, 
  hideDownload = false 
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const mergedOptions = { ...defaultOptions, ...options };

  useImperativeHandle(ref, () => ({
    download: async (name?: string) => {
      await handleDownload(name);
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const qr = new QRCodeStyling({
      width: size,
      height: size,
      data: data || "https://example.com",
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
      },
      dotsOptions: {
        color: mergedOptions.dotColor,
        type: (mergedOptions.dotStyle || "square").replace("_", "-") as any,
      },
      backgroundOptions: {
        color: mergedOptions.bgColor,
      },
      cornersSquareOptions: {
        color: mergedOptions.eyeColor || mergedOptions.dotColor,
        type: (mergedOptions.eyeStyle || "square") as any,
      },
      cornersDotOptions: {
        color: mergedOptions.eyeColor || mergedOptions.dotColor,
        type: mergedOptions.eyeStyle === 'square' ? 'square' : 'dot' as any,
      },
      image: mergedOptions.logoUrl,
    });

    qrRef.current = qr;
    containerRef.current.innerHTML = "";
    qr.append(containerRef.current);
    setLoading(false);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [data, size, mergedOptions]);

  useEffect(() => {
    if (qrRef.current && data) {
      qrRef.current.update({
        data: data || "https://example.com",
      });
    }
  }, [data]);

  const handleDownload = async (name?: string) => {
    if (!qrRef.current) return;
    setDownloading(true);
    try {
      await qrRef.current.download({ 
        name: name || downloadName || "qr-code", 
        extension: "png" 
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-center">
        {!data ? (
          <div
            className="flex items-center justify-center bg-gray-100 rounded-lg"
            style={{ width: size, height: size }}
          >
            <p className="text-sm text-gray-400">QR code will appear here</p>
          </div>
        ) : (
          <div className="relative">
            {loading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-[1px] z-10"
                style={{ width: size, height: size }}
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
              </div>
            )}
            <div
              ref={containerRef}
              className={cn(
                "overflow-hidden transition-all duration-300",
                mergedOptions.frameStyle === "rounded" && "rounded-[2rem] p-4 border-[6px]",
                mergedOptions.frameStyle === "simple" && "rounded-lg p-2 border-[4px]",
                mergedOptions.frameStyle === "badge_below" && "rounded-2xl p-4 border-[6px] border-b-[24px]",
                mergedOptions.frameStyle === "badge_above" && "rounded-2xl p-4 border-[6px] border-t-[24px]",
                mergedOptions.frameStyle === "bubble" && "rounded-[2.5rem] p-5 border-[6px] rounded-br-none",
                mergedOptions.frameStyle === "none" ? "rounded-lg" : ""
              )}
              style={{ 
                width: mergedOptions.frameStyle === "none" ? size : size + 40, 
                height: mergedOptions.frameStyle === "none" ? size : size + 40,
                borderColor: mergedOptions.frameColor || mergedOptions.dotColor,
                backgroundColor: mergedOptions.bgColor
              }}
            />
          </div>
        )}
      </div>

      {data && !hideDownload && (
        <button
          onClick={() => handleDownload(downloadName)}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PNG
        </button>
      )}
    </div>
  );
});

QRPreview.displayName = "QRPreview";


