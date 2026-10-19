"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Settings, 
  Pencil, 
  Copy, 
  Trash2, 
  QrCode,
  GripHorizontal
} from "lucide-react";
import { CanvasElement } from "./element-properties-sheet";
import { cn } from "@/lib/utils";

interface LabelCanvasProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (element: CanvasElement | null) => void;
  onUpdateElement: (updated: CanvasElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (element: CanvasElement) => void;
  onOpenProperties: () => void;
  onOpenSettings: () => void;
  showGrid: boolean;
  snapToElements: boolean;
  showMargins: boolean;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  labelWidth?: number;
  labelHeight?: number;
  hasFrame?: boolean;
  onOpenFrames?: () => void;
}

interface ActiveSnapLine {
  type: "vertical" | "horizontal";
  pos: number;
}

export function LabelCanvas({
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onOpenProperties,
  onOpenSettings,
  showGrid,
  snapToElements,
  showMargins,
  zoom,
  setZoom,
  pan,
  setPan,
  labelWidth = 390,
  labelHeight = 580,
  hasFrame = true,
  onOpenFrames,
}: LabelCanvasProps) {
  // Canvas Panning state (moving entire canvas / label left, right, top, bottom)
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number } | null>(null);

  // Drag state (moving an individual element on the label)
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    initialElemX: number;
    initialElemY: number;
  } | null>(null);

  // Resize state (resizing width/height of an element)
  const [resizeState, setResizeState] = useState<{
    elementId: string;
    direction: "se" | "e" | "s";
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  // Smart Alignment Snap Lines compared to nearest elements
  const [snapLines, setSnapLines] = useState<ActiveSnapLine[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{
    dist?: number;
    initialZoom?: number;
    touch1X: number;
    touch1Y: number;
    initialPanX: number;
    initialPanY: number;
    isMultiTouch: boolean;
  } | null>(null);

  const LABEL_WIDTH = labelWidth;
  const LABEL_HEIGHT = labelHeight;
  const SNAP_THRESHOLD = 5;

  // --- Zoom using Mouse Wheel on Desktop (Without Zooming the Webpage) ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      const zoomStep = 6;
      if (delta < 0) {
        setZoom((prev) => Math.min(prev + zoomStep, 200));
      } else {
        setZoom((prev) => Math.max(prev - zoomStep, 50));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [setZoom]);

  // --- Touch Gestures on Mobile: Panning & Pinch Zoom (Without Webpage Zoom) ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // If clicking inside button or element, don't hijack touch
      if (
        (e.target as HTMLElement).closest(".canvas-element-item") ||
        (e.target as HTMLElement).closest("button")
      ) {
        return;
      }

      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStartRef.current = {
          dist,
          initialZoom: zoom,
          touch1X: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          touch1Y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          initialPanX: pan.x,
          initialPanY: pan.y,
          isMultiTouch: true,
        };
      } else if (e.touches.length === 1) {
        touchStartRef.current = {
          touch1X: e.touches[0].clientX,
          touch1Y: e.touches[0].clientY,
          initialPanX: pan.x,
          initialPanY: pan.y,
          isMultiTouch: false,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      // 2-finger pinch zoom and pan
      if (e.touches.length === 2 && touchStartRef.current.isMultiTouch && touchStartRef.current.dist) {
        e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / touchStartRef.current.dist;
        const newZoom = Math.max(50, Math.min(200, Math.round((touchStartRef.current.initialZoom || 100) * factor)));
        setZoom(newZoom);

        const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const dx = currentMidX - touchStartRef.current.touch1X;
        const dy = currentMidY - touchStartRef.current.touch1Y;
        setPan({
          x: Math.round(touchStartRef.current.initialPanX + dx),
          y: Math.round(touchStartRef.current.initialPanY + dy),
        });
      }
      // 1-finger canvas pan
      else if (e.touches.length === 1 && !touchStartRef.current.isMultiTouch) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchStartRef.current.touch1X;
        const dy = e.touches[0].clientY - touchStartRef.current.touch1Y;
        setPan({
          x: Math.round(touchStartRef.current.initialPanX + dx),
          y: Math.round(touchStartRef.current.initialPanY + dy),
        });
      }
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [zoom, pan, setZoom, setPan]);

  // Pointer Down on Background -> Starts Canvas & Label Panning (Left, Right, Top, Bottom)
  const handleContainerPointerDown = (e: React.PointerEvent) => {
    // If clicking on element item, resizing handle, or button, ignore
    if (
      (e.target as HTMLElement).closest(".canvas-element-item") ||
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }

    onSelectElement(null);
    setIsPanning(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  // Pointer Down for Moving Element
  const handlePointerDownMove = (e: React.PointerEvent, element: CanvasElement) => {
    e.stopPropagation();
    onSelectElement(element);

    setDragState({
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      initialElemX: element.x,
      initialElemY: element.y,
    });
  };

  // Pointer Down for Resizing Element
  const handlePointerDownResize = (
    e: React.PointerEvent,
    element: CanvasElement,
    direction: "se" | "e" | "s"
  ) => {
    e.stopPropagation();
    setResizeState({
      elementId: element.id,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: element.width || 100,
      initialHeight: element.height || 40,
    });
  };

  // Combined Pointer Move: Canvas Pan, Element Drag, or Element Resize
  const handlePointerMove = useCallback((e: PointerEvent) => {
    // 1. Panning the whole canvas & label (Left/Right/Top/Bottom)
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.startX;
      const dy = e.clientY - panStartRef.current.startY;
      setPan({
        x: Math.round(panStartRef.current.initialPanX + dx),
        y: Math.round(panStartRef.current.initialPanY + dy),
      });
      return;
    }

    const scale = zoom / 100;

    // 2. Moving an Element & Smart Snapping to Nearest Elements
    if (dragState) {
      const dx = (e.clientX - dragState.startX) / scale;
      const dy = (e.clientY - dragState.startY) / scale;

      const currentElem = elements.find((el) => el.id === dragState.elementId);
      if (!currentElem) return;

      const elemW = currentElem.width || 50;
      const elemH = currentElem.height || 20;

      let rawX = dragState.initialElemX + dx;
      let rawY = dragState.initialElemY + dy;

      const detectedLines: ActiveSnapLine[] = [];

      if (snapToElements) {
        const otherElements = elements.filter((el) => el.id !== currentElem.id);

        for (const other of otherElements) {
          const otherW = other.width || 50;
          const otherH = other.height || 20;

          // Vertical Snap: Left to Left
          if (Math.abs(rawX - other.x) < SNAP_THRESHOLD) {
            rawX = other.x;
            detectedLines.push({ type: "vertical", pos: other.x });
          }
          // Vertical Snap: Right to Right
          else if (Math.abs((rawX + elemW) - (other.x + otherW)) < SNAP_THRESHOLD) {
            rawX = other.x + otherW - elemW;
            detectedLines.push({ type: "vertical", pos: other.x + otherW });
          }
          // Vertical Snap: Center to Center
          else if (Math.abs((rawX + elemW / 2) - (other.x + otherW / 2)) < SNAP_THRESHOLD) {
            rawX = other.x + otherW / 2 - elemW / 2;
            detectedLines.push({ type: "vertical", pos: other.x + otherW / 2 });
          }

          // Horizontal Snap: Top to Top
          if (Math.abs(rawY - other.y) < SNAP_THRESHOLD) {
            rawY = other.y;
            detectedLines.push({ type: "horizontal", pos: other.y });
          }
          // Horizontal Snap: Bottom to Bottom
          else if (Math.abs((rawY + elemH) - (other.y + otherH)) < SNAP_THRESHOLD) {
            rawY = other.y + otherH - elemH;
            detectedLines.push({ type: "horizontal", pos: other.y + otherH });
          }
          // Horizontal Snap: Center to Center
          else if (Math.abs((rawY + elemH / 2) - (other.y + otherH / 2)) < SNAP_THRESHOLD) {
            rawY = other.y + otherH / 2 - elemH / 2;
            detectedLines.push({ type: "horizontal", pos: other.y + otherH / 2 });
          }
        }

        // Snap to Sticker Canvas Center X and Y
        const stickerCenterX = LABEL_WIDTH / 2;
        if (Math.abs((rawX + elemW / 2) - stickerCenterX) < SNAP_THRESHOLD) {
          rawX = stickerCenterX - elemW / 2;
          detectedLines.push({ type: "vertical", pos: stickerCenterX });
        }

        const stickerCenterY = LABEL_HEIGHT / 2;
        if (Math.abs((rawY + elemH / 2) - stickerCenterY) < SNAP_THRESHOLD) {
          rawY = stickerCenterY - elemH / 2;
          detectedLines.push({ type: "horizontal", pos: stickerCenterY });
        }
      }

      const clampedX = Math.max(0, Math.min(LABEL_WIDTH - elemW, Math.round(rawX)));
      const clampedY = Math.max(0, Math.min(LABEL_HEIGHT - elemH, Math.round(rawY)));

      setSnapLines(detectedLines);
      onUpdateElement({ ...currentElem, x: clampedX, y: clampedY });
      return;
    }

    // 3. Resizing an Element
    if (resizeState) {
      const dx = (e.clientX - resizeState.startX) / scale;
      const dy = (e.clientY - resizeState.startY) / scale;

      const currentElem = elements.find((el) => el.id === resizeState.elementId);
      if (!currentElem) return;

      let newWidth = currentElem.width;
      let newHeight = currentElem.height;

      if (resizeState.direction === "se" || resizeState.direction === "e") {
        newWidth = Math.max(30, Math.min(LABEL_WIDTH - currentElem.x, Math.round(resizeState.initialWidth + dx)));
      }

      if (resizeState.direction === "se" || resizeState.direction === "s") {
        newHeight = Math.max(16, Math.min(LABEL_HEIGHT - currentElem.y, Math.round(resizeState.initialHeight + dy)));
      }

      onUpdateElement({ ...currentElem, width: newWidth, height: newHeight });
    }
  }, [isPanning, dragState, resizeState, zoom, snapToElements, elements, onUpdateElement, setPan]);

  const handlePointerUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
    if (dragState || resizeState) {
      setDragState(null);
      setResizeState(null);
      setSnapLines([]);
    }
  }, [isPanning, dragState, resizeState]);

  useEffect(() => {
    if (isPanning || dragState || resizeState) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [isPanning, dragState, resizeState, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handleContainerPointerDown}
      style={{ touchAction: "none", overscrollBehavior: "contain" }}
      className={cn(
        "relative w-full h-full flex-1 flex flex-col items-center justify-center overflow-hidden bg-slate-100/90 dark:bg-slate-950/80 p-4 sm:p-8 select-none transition-colors",
        isPanning ? "cursor-grabbing" : "cursor-grab"
      )}
    >
      {/* Background Alignment Grid that scrolls with Canvas Pan */}
      {showGrid && (
        <div 
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: `16px 16px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            color: "rgb(148, 163, 184)",
          }}
        />
      )}

      {/* Top-Left Corner: Canvas Settings Icon */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 left-4 sm:left-6 z-20 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title="Canvas Settings (Grid, Snap, Margins, Reset Pan/Zoom)"
          aria-label="Canvas Settings"
        >
          <Settings className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Main Thermal Sticker Printable Canvas - Movable in all directions */}
      <div 
        className="my-auto origin-center shrink-0 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom / 100})`,
        }}
      >
        {hasFrame ? (
          <div
            ref={stickerRef}
            style={{ width: `${LABEL_WIDTH}px`, height: `${LABEL_HEIGHT}px` }}
            className="relative bg-white rounded-2xl shadow-2xl border-2 border-slate-300/80 text-slate-950 overflow-visible ring-1 ring-slate-900/10"
          >
            {/* Printable Safe Margins (Dashed Inset Guide) */}
            {showMargins && (
              <div className="absolute inset-2.5 rounded-xl border border-dashed border-emerald-500/25 pointer-events-none z-0" />
            )}

            {/* Dynamic Smart Alignment Snap Lines compared to nearest elements */}
            {snapLines.map((line, idx) => {
              if (line.type === "vertical") {
                return (
                  <div
                    key={`v-${idx}`}
                    style={{ left: `${line.pos}px` }}
                    className="absolute top-0 bottom-0 w-[1.5px] border-l border-dashed border-emerald-500 z-30 pointer-events-none shadow-xs"
                  />
                );
              }
              return (
                <div
                  key={`h-${idx}`}
                  style={{ top: `${line.pos}px` }}
                  className="absolute left-0 right-0 h-[1.5px] border-t border-dashed border-emerald-500 z-30 pointer-events-none shadow-xs"
                />
              );
            })}

            {/* Render All Moveable and Resizable Elements */}
            {elements.map((elem) => {
            const isSelected = selectedElementId === elem.id;

            return (
              <div
                key={elem.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(elem);
                }}
                onPointerDown={(e) => handlePointerDownMove(e, elem)}
                style={{
                  position: "absolute",
                  left: `${elem.x}px`,
                  top: `${elem.y}px`,
                  width: elem.width ? `${elem.width}px` : "auto",
                  height: elem.height ? `${elem.height}px` : "auto",
                }}
                className={cn(
                  "canvas-element-item cursor-move transition-shadow rounded-lg select-none group z-10",
                  isSelected
                    ? "ring-2 ring-emerald-500 bg-emerald-50/20 shadow-md"
                    : "hover:ring-1 hover:ring-slate-300 hover:bg-slate-50/50"
                )}
              >
                {/* Visual Content Based on Element Type */}
                <div className="w-full h-full p-1.5 flex flex-col justify-center overflow-hidden">
                  {elem.type === "qr" && (
                    <div className="w-full h-full flex items-center justify-center bg-white border border-slate-900/80 rounded-md p-1 shadow-2xs">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                  )}

                  {elem.type === "barcode" && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <svg viewBox="0 0 240 44" className="w-full h-full max-h-12" preserveAspectRatio="none">
                        <rect x="0" y="0" width="3" height="44" fill="#0f172a" />
                        <rect x="6" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="11" y="0" width="5" height="44" fill="#0f172a" />
                        <rect x="19" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="24" y="0" width="4" height="44" fill="#0f172a" />
                        <rect x="31" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="36" y="0" width="6" height="44" fill="#0f172a" />
                        <rect x="45" y="0" width="3" height="44" fill="#0f172a" />
                        <rect x="51" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="56" y="0" width="5" height="44" fill="#0f172a" />
                        <rect x="64" y="0" width="4" height="44" fill="#0f172a" />
                        <rect x="71" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="76" y="0" width="6" height="44" fill="#0f172a" />
                        <rect x="85" y="0" width="3" height="44" fill="#0f172a" />
                        <rect x="91" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="96" y="0" width="4" height="44" fill="#0f172a" />
                        <rect x="103" y="0" width="5" height="44" fill="#0f172a" />
                        <rect x="111" y="0" width="3" height="44" fill="#0f172a" />
                        <rect x="117" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="122" y="0" width="6" height="44" fill="#0f172a" />
                        <rect x="131" y="0" width="3" height="44" fill="#0f172a" />
                        <rect x="137" y="0" width="5" height="44" fill="#0f172a" />
                        <rect x="145" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="150" y="0" width="4" height="44" fill="#0f172a" />
                        <rect x="157" y="0" width="3" height="44" fill="#0f172a" />
                        <rect x="163" y="0" width="6" height="44" fill="#0f172a" />
                        <rect x="172" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="177" y="0" width="4" height="44" fill="#0f172a" />
                        <rect x="184" y="0" width="5" height="44" fill="#0f172a" />
                        <rect x="192" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="197" y="0" width="6" height="44" fill="#0f172a" />
                        <rect x="206" y="0" width="3" height="44" fill="#0f172a" />
                        <rect x="212" y="0" width="5" height="44" fill="#0f172a" />
                        <rect x="220" y="0" width="2" height="44" fill="#0f172a" />
                        <rect x="225" y="0" width="4" height="44" fill="#0f172a" />
                        <rect x="232" y="0" width="3" height="44" fill="#0f172a" />
                        <rect x="238" y="0" width="2" height="44" fill="#0f172a" />
                      </svg>
                      <span className="font-mono text-[11px] font-black tracking-widest text-slate-900 mt-0.5">
                        {elem.content}
                      </span>
                    </div>
                  )}

                  {elem.type === "line" && (
                    <div className="w-full h-[2px] bg-slate-950 my-auto" />
                  )}

                  {elem.type === "rectangle" && (
                    <div className="w-full h-full border-2 border-slate-900 rounded-lg" />
                  )}

                  {elem.type === "circle" && (
                    <div className="w-full h-full border-2 border-slate-900 rounded-full flex items-center justify-center p-1">
                      <span className="text-[10px] font-black uppercase">{elem.content}</span>
                    </div>
                  )}

                  {elem.type === "box" && (
                    <div className="w-full h-full border-2 border-dashed border-slate-900 rounded-lg" />
                  )}

                  {elem.type === "table" && (
                    <div className="w-full h-full border border-slate-300 rounded p-1.5 bg-slate-50 text-[10px] font-mono text-slate-700 flex items-center justify-between">
                      <span>{elem.content}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">GRID</span>
                    </div>
                  )}

                  {elem.type !== "qr" && elem.type !== "barcode" && elem.type !== "line" && elem.type !== "rectangle" && elem.type !== "circle" && elem.type !== "box" && elem.type !== "table" && (
                    <div className="flex flex-col justify-center">
                      <span
                        className={cn(
                          "leading-tight text-slate-900",
                          elem.fontSize === "3xl" ? "text-2xl font-black" :
                          elem.fontSize === "2xl" ? "text-xl font-black" :
                          elem.fontSize === "xl" ? "text-lg font-black" :
                          elem.fontSize === "lg" ? "text-base font-extrabold" :
                          elem.fontSize === "sm" ? "text-xs font-semibold" :
                          elem.fontSize === "xs" ? "text-[10px] font-medium" : "text-sm font-bold",
                          elem.fontWeight === "black" ? "font-black" :
                          elem.fontWeight === "bold" ? "font-bold" :
                          elem.fontWeight === "medium" ? "font-medium" : "font-normal",
                          elem.fontStyle === "italic" ? "italic" : "not-italic",
                          elem.textDecoration === "underline" ? "underline underline-offset-2" : "",
                          elem.fontFamily === "mono" ? "font-mono" :
                          elem.fontFamily === "serif" ? "font-serif" :
                          elem.fontFamily === "display" ? "tracking-tight font-black" : "font-sans",
                          elem.align === "center" ? "text-center" :
                          elem.align === "right" ? "text-right" :
                          elem.align === "justify" ? "text-justify" : "text-left",
                          elem.textTransform === "uppercase" ? "uppercase" :
                          elem.textTransform === "capitalize" ? "capitalize" :
                          elem.textTransform === "lowercase" ? "lowercase" : "",
                          elem.letterSpacing === "widest" ? "tracking-widest" :
                          elem.letterSpacing === "wider" ? "tracking-wider" : "tracking-normal"
                        )}
                      >
                        {elem.content}
                      </span>
                      {elem.subContent && (
                        <span className="text-[10px] text-slate-500 font-medium whitespace-pre-line leading-tight mt-0.5">
                          {elem.subContent}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Selection Ring & Resizing Handles when Element is Selected */}
                {isSelected && (
                  <>
                    {/* Corner Selection Pips */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full shadow-xs pointer-events-none" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full shadow-xs pointer-events-none" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full shadow-xs pointer-events-none" />

                    {/* Resizing Handle on Bottom-Right (SE) */}
                    <div
                      onPointerDown={(e) => handlePointerDownResize(e, elem, "se")}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-md cursor-se-resize flex items-center justify-center z-40 active:scale-125 transition-transform"
                      title="Drag to resize width and height"
                    />

                    {/* Resizing Handle on Right Edge (E) */}
                    <div
                      onPointerDown={(e) => handlePointerDownResize(e, elem, "e")}
                      className="absolute top-1/2 -translate-y-1/2 -right-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm cursor-e-resize z-40"
                      title="Drag to resize width"
                    />

                    {/* Resizing Handle on Bottom Edge (S) */}
                    <div
                      onPointerDown={(e) => handlePointerDownResize(e, elem, "s")}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm cursor-s-resize z-40"
                      title="Drag to resize height"
                    />

                    {/* Prominent Contextual Action Pill: Edit, Duplicate, Delete */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "absolute flex items-center gap-1 bg-slate-900 text-white p-1 rounded-2xl shadow-2xl z-50 backdrop-blur-md border border-slate-700/90 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100",
                        elem.y < 46 ? "top-full mt-2.5" : "-top-12",
                        elem.x < 45 ? "left-0" : elem.x > LABEL_WIDTH - (elem.width || 50) - 45 ? "right-0" : "left-1/2 -translate-x-1/2"
                      )}
                    >
                      {/* 1. Edit */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProperties();
                        }}
                        className="px-2.5 py-1 rounded-xl hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer"
                        title="Edit Element Properties & Style"
                      >
                        <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Edit</span>
                      </button>

                      <div className="w-px h-3.5 bg-slate-700 my-auto" />

                      {/* 2. Duplicate */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateElement(elem);
                        }}
                        className="px-2.5 py-1 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer"
                        title="Duplicate Element"
                      >
                        <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Duplicate</span>
                      </button>

                      <div className="w-px h-3.5 bg-slate-700 my-auto" />

                      {/* 3. Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement(elem.id);
                        }}
                        className="px-2.5 py-1 rounded-xl hover:bg-rose-950 text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 text-xs font-bold active:scale-95 cursor-pointer"
                        title="Delete Element"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
          /* Initial / Deleted Frame State: Minimal Prompt */
          <div 
            onClick={onOpenFrames}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenFrames?.();
              }
            }}
            style={{ width: "360px", minHeight: "260px" }}
            className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs text-center cursor-pointer hover:border-emerald-500/80 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all group shadow-sm select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-emerald-500/20">
              <span className="text-xl font-bold">#</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
              Choose suitable label frame for your business
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
              Select standard billing receipt shapes or enter custom width and length
            </p>
            <div className="mt-4 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 group-hover:bg-emerald-700 transition-colors">
              Pick Frame
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
