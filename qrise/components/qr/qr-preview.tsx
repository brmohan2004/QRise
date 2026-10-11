"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import QRCodeStyling from "qr-code-styling";
import { Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QRDesign, QRShapeType } from "@/types/qr.types";
import { SHAPE_METADATA, renderTagShape } from "@/lib/qr-shapes";

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

const RMQR_VERSIONS = [
  "R7x43", "R7x59", "R7x77", "R7x99", "R7x139",
  "R9x43", "R9x59", "R9x77", "R9x99", "R9x139",
  "R11x27", "R11x43", "R11x59", "R11x77", "R11x99", "R11x139",
  "R13x27", "R13x43", "R13x59", "R13x77", "R13x99", "R13x139",
  "R15x43", "R15x59", "R15x77", "R15x99", "R15x139",
  "R17x43", "R17x59", "R17x77", "R17x99", "R17x139",
];

function getBestRMQRVersion(bwip: any, text: string) {
  for (const v of RMQR_VERSIONS) {
    try {
      bwip.toSVG({ bcid: "rectangularmicroqrcode", text, version: v });
      return v;
    } catch {
      // try next version
    }
  }
  return "R17x139";
}

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
  const [shapeNotice, setShapeNotice] = useState<string | null>(null);

  const mergedOptions = { ...defaultOptions, ...options };
  const shape = (mergedOptions.shape || "square") as QRShapeType;
  const shapeMeta = SHAPE_METADATA[shape];

  const finalWidth = mergedOptions.width || (shapeMeta ? shapeMeta.width : size);
  const finalHeight = mergedOptions.height || (shapeMeta ? shapeMeta.height : size);

  useImperativeHandle(ref, () => ({
    download: async (name?: string) => {
      await handleDownload(name);
    }
  }));

  useEffect(() => {
    let isCancelled = false;
    if (!containerRef.current) return;

    async function renderQR() {
      if (!containerRef.current || isCancelled) return;
      setLoading(true);

      const targetData = data || "https://example.com";
      const dotColor = mergedOptions.dotColor || "#000000";
      const bgColor = mergedOptions.bgColor || "#ffffff";
      const cleanDot = dotColor.replace("#", "");
      const cleanBg = bgColor.replace("#", "");

      if (shape !== "square") {
        try {
          const bwipModule = await import("bwip-js");
          const bwip = (bwipModule as any).default || bwipModule;

          if (isCancelled || !containerRef.current) return;

          const canvas = document.createElement("canvas");

          if (shape === "micro") {
            try {
              const minDim = Math.min(finalWidth, finalHeight);
              bwip.toCanvas(canvas, {
                bcid: "microqrcode",
                text: targetData,
                scale: Math.max(3, Math.round(minDim / 40)),
                barcolor: cleanDot,
                backgroundcolor: cleanBg,
                includetext: false,
                padding: Math.max(6, Math.round(minDim * 0.05)),
              });
              setShapeNotice(shapeMeta?.scannabilityNote || null);
            } catch {
              // Micro QR ISO M4 holds max 15-21 characters. Fallback to compact preview sample
              const sample = targetData.length > 15 ? targetData.slice(0, 15) : "QRise.com";
              bwip.toCanvas(canvas, {
                bcid: "microqrcode",
                text: sample,
                scale: Math.max(3, Math.round(Math.min(finalWidth, finalHeight) / 40)),
                barcolor: cleanDot,
                backgroundcolor: cleanBg,
                includetext: false,
                padding: 10,
              });
              setShapeNotice("Micro QR supports max 15–21 characters. Showing compact sample. Use Standard or Rectangular shape for long URLs.");
            }
          } else if (shape === "rectangular") {
            try {
              const bestVersion = getBestRMQRVersion(bwip, targetData);
              bwip.toCanvas(canvas, {
                bcid: "rectangularmicroqrcode",
                text: targetData,
                version: bestVersion,
                scale: Math.max(2, Math.round(finalWidth / 110)),
                barcolor: cleanDot,
                backgroundcolor: cleanBg,
                includetext: false,
                padding: Math.max(4, Math.round(finalHeight * 0.04)),
              });
              setShapeNotice(shapeMeta?.scannabilityNote || null);
            } catch {
              setShapeNotice("Rectangular (rMQR) capacity exceeded for this data length.");
            }
          } else {
            // Render the 9 additional mobile tagging shapes with dynamic width & height!
            try {
              renderTagShape(canvas, shape, targetData, bwip, dotColor, bgColor, finalWidth, finalHeight);
              setShapeNotice(shapeMeta?.scannabilityNote || null);
            } catch (shapeErr) {
              console.error(`Rendering shape ${shape} failed:`, shapeErr);
              setShapeNotice(`Notice: Showing ${shapeMeta?.label || shape} preview.`);
            }
          }

          if (mergedOptions.logoUrl) {
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            logo.onload = () => {
              if (isCancelled) return;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                const logoSize = Math.min(canvas.width, canvas.height) * 0.22;
                const lx = (canvas.width - logoSize) / 2;
                const ly = (canvas.height - logoSize) / 2;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(lx - 2, ly - 2, logoSize + 4, logoSize + 4);
                ctx.drawImage(logo, lx, ly, logoSize, logoSize);
              }
            };
            logo.src = mergedOptions.logoUrl;
          }

          if (containerRef.current) {
            containerRef.current.innerHTML = "";
            containerRef.current.appendChild(canvas);
          }
          qrRef.current = null;
          setLoading(false);
          return;
        } catch (err) {
          console.error("BWIP/Shape rendering failed:", err);
        }
      }

      // Default Standard Square QR Code (using QRCodeStyling)
      setShapeNotice(null);
      const dotStyle = (mergedOptions.dotStyle || "square").replace("_", "-");
      const eyeStyle = (mergedOptions.eyeStyle || "square").replace("_", "-");

      const qr = new QRCodeStyling({
        width: finalWidth,
        height: finalHeight,
        margin: 12,
        data: targetData,
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 5,
        },
        qrOptions: {
          typeNumber: (mergedOptions.qrVersion || 0) as any,
          errorCorrectionLevel: "Q",
        },
        dotsOptions: {
          color: mergedOptions.dotColor,
          type: dotStyle as any,
        },
        backgroundOptions: {
          color: mergedOptions.bgColor,
        },
        cornersSquareOptions: {
          color: mergedOptions.eyeColor || mergedOptions.dotColor,
          type: eyeStyle as any,
        },
        cornersDotOptions: {
          color: mergedOptions.eyeColor || mergedOptions.dotColor,
          type: (eyeStyle === "square" ? "square" : "dot") as any,
        },
        image: mergedOptions.logoUrl,
      });

      if (isCancelled || !containerRef.current) return;
      qrRef.current = qr;
      containerRef.current.innerHTML = "";
      qr.append(containerRef.current);
      setLoading(false);
    }

    renderQR();

    return () => {
      isCancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [
    data,
    finalWidth,
    finalHeight,
    shape,
    mergedOptions.dotColor,
    mergedOptions.bgColor,
    mergedOptions.dotStyle,
    mergedOptions.eyeColor,
    mergedOptions.eyeStyle,
    mergedOptions.logoUrl,
    mergedOptions.qrVersion,
    mergedOptions.frameStyle,
    mergedOptions.frameColor,
    mergedOptions.frameText,
  ]);

  const handleDownload = async (name?: string) => {
    if (!containerRef.current) return;
    setDownloading(true);
    
    try {
      const qrCanvas = containerRef.current.querySelector("canvas");
      if (!qrCanvas) throw new Error("QR Canvas not found");

      if (mergedOptions.frameStyle === "none") {
        if (qrRef.current) {
          await qrRef.current.download({ 
            name: name || downloadName || "qr-code", 
            extension: "png" 
          });
          return;
        } else {
          const link = document.createElement("a");
          link.download = `${name || downloadName || "qr-code"}.png`;
          link.href = qrCanvas.toDataURL("image/png");
          link.click();
          return;
        }
      }

      // Create a composite canvas to include the frame
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const padding = 12;
      const borderSize = mergedOptions.frameStyle === "simple" ? 4 : 6;
      const hasText = mergedOptions.frameText && (mergedOptions.frameStyle === "badge_below" || mergedOptions.frameStyle === "badge_above");
      const textSpace = hasText ? 28 : 0;
      
      const qrWidth = qrCanvas.width > 0 ? qrCanvas.width : finalWidth;
      const qrHeight = qrCanvas.height > 0 ? qrCanvas.height : finalHeight;
      
      const totalWidth = qrWidth + (padding * 2) + (borderSize * 2);
      const totalHeight = qrHeight + (padding * 2) + (borderSize * 2) + textSpace;

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
      
      drawRoundedRect(qrAreaX, qrAreaY, qrWidth + 8, qrHeight + 8, 8);

      // Draw QR Code
      ctx.drawImage(qrCanvas, qrAreaX + 4, qrAreaY + 4, qrWidth, qrHeight);

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
      <div className="flex justify-center max-w-full overflow-hidden">
        {!data ? (
          <div
            className="flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg max-w-full"
            style={{ width: finalWidth, height: finalHeight, aspectRatio: `${finalWidth}/${finalHeight}` }}
          >
            <p className="text-sm text-gray-400">QR code will appear here</p>
          </div>
        ) : (
          <div className="relative max-w-full">
            {loading && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-20"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
              </div>
            )}
            <div
              className={cn(
                "relative transition-all duration-500 ease-in-out flex flex-col items-center justify-center max-w-full",
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
                className="bg-white rounded-lg shadow-sm overflow-hidden [&_canvas]:max-w-full [&_canvas]:h-auto flex items-center justify-center"
                style={{ 
                  maxWidth: '100%',
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

      {shapeNotice && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-tight text-center">
          {shapeNotice}
        </div>
      )}

      {data && !hideDownload && (
        <button
          onClick={() => handleDownload(downloadName)}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
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


