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
      margin: 12,
      data: data || "https://example.com",
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
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
    if (!qrRef.current || !containerRef.current) return;
    setDownloading(true);
    
    try {
      const qrCanvas = containerRef.current.querySelector("canvas");
      if (!qrCanvas) throw new Error("QR Canvas not found");

      if (mergedOptions.frameStyle === "none") {
        await qrRef.current.download({ 
          name: name || downloadName || "qr-code", 
          extension: "png" 
        });
        return;
      }

      // Create a composite canvas to include the frame
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const padding = 12;
      const borderSize = mergedOptions.frameStyle === "simple" ? 4 : 6;
      const hasText = mergedOptions.frameText && (mergedOptions.frameStyle === "badge_below" || mergedOptions.frameStyle === "badge_above");
      const textSpace = hasText ? 28 : 0;
      
      const totalWidth = size + (padding * 2) + (borderSize * 2);
      const totalHeight = size + (padding * 2) + (borderSize * 2) + textSpace;

      canvas.width = totalWidth * 2; // High DPI
      canvas.height = totalHeight * 2;
      ctx.scale(2, 2);

      const frameColor = mergedOptions.frameColor || mergedOptions.dotColor;
      
      // Draw frame background
      ctx.fillStyle = frameColor;
      
      const radius = mergedOptions.frameStyle === "bubble" ? 40 : 
                    mergedOptions.frameStyle === "rounded" ? 32 : 16;
      
      const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, skipBottomRight = false) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - (skipBottomRight ? 0 : r));
        if (!skipBottomRight) ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
      };

      drawRoundedRect(0, 0, totalWidth, totalHeight, radius, mergedOptions.frameStyle === "bubble");

      // Draw QR background (white)
      ctx.fillStyle = "#ffffff";
      const qrAreaX = borderSize + padding - 4;
      const qrAreaY = borderSize + padding - 4 + (mergedOptions.frameStyle === "badge_above" ? textSpace : 0);
      const qrAreaSize = size + 8;
      drawRoundedRect(qrAreaX, qrAreaY, qrAreaSize, qrAreaSize, 8);

      // Draw QR Code
      ctx.drawImage(qrCanvas, qrAreaX + 4, qrAreaY + 4, size, size);

      // Draw text if present
      if (hasText && mergedOptions.frameText) {
        ctx.fillStyle = mergedOptions.frameTextColor || "#ffffff";
        ctx.font = "900 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const textY = mergedOptions.frameStyle === "badge_above" 
          ? borderSize + (textSpace / 2) 
          : totalHeight - borderSize - (textSpace / 2);
        
        ctx.fillText(mergedOptions.frameText.toUpperCase(), totalWidth / 2, textY);
      }

      const link = document.createElement("a");
      link.download = `${name || downloadName || "qr-code"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
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
                className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-[1px] z-20"
                style={{ width: size, height: size }}
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
              </div>
            )}
            <div
              className={cn(
                "relative transition-all duration-500 ease-in-out flex flex-col items-center justify-center",
                mergedOptions.frameStyle === "rounded" && "rounded-[2rem] border-[6px]",
                mergedOptions.frameStyle === "simple" && "rounded-xl border-[4px]",
                mergedOptions.frameStyle === "badge_below" && "rounded-2xl border-[6px]",
                mergedOptions.frameStyle === "badge_above" && "rounded-2xl border-[6px]",
                mergedOptions.frameStyle === "bubble" && "rounded-[2.5rem] border-[6px] rounded-br-none",
                mergedOptions.frameStyle === "none" ? "rounded-xl" : ""
              )}
              style={{ 
                padding: mergedOptions.frameStyle === "none" ? "0" : "12px",
                borderColor: mergedOptions.frameStyle === "none" ? "transparent" : (mergedOptions.frameColor || mergedOptions.dotColor),
                backgroundColor: mergedOptions.frameStyle === "none" ? "transparent" : (mergedOptions.frameColor || mergedOptions.dotColor),
              }}
            >
              {mergedOptions.frameStyle === "badge_above" && mergedOptions.frameText && (
                <div 
                  className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-center w-full px-2"
                  style={{ color: mergedOptions.frameTextColor || "#ffffff" }}
                >
                  {mergedOptions.frameText}
                </div>
              )}

              <div
                ref={containerRef}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
                style={{ 
                  width: size, 
                  height: size,
                }}
              />

              {mergedOptions.frameStyle === "badge_below" && mergedOptions.frameText && (
                <div 
                  className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-center w-full px-2"
                  style={{ color: mergedOptions.frameTextColor || "#ffffff" }}
                >
                  {mergedOptions.frameText}
                </div>
              )}
            </div>
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


