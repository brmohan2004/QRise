"use client";

import React, { useState, useEffect, use } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { toast } from "sonner";
import { CreateLabelHeader } from "./components/create-label-header";
import { LabelCanvas } from "./components/label-canvas";
import { AddElementSheet, ElementType } from "./components/add-element-sheet";
import { ElementPropertiesSheet, CanvasElement } from "./components/element-properties-sheet";
import { CanvasBottomToolbar, BottomToolType } from "./components/canvas-bottom-toolbar";
import { ShapesDialog, ShapeType } from "./components/shapes-dialog";
import { PrintPreviewDialog } from "./components/print-preview-dialog";
import { CanvasSettingsDialog } from "./components/canvas-settings-dialog";
import { FramesDialog, LABEL_FRAMES, LabelFramePreset } from "./components/frames-dialog";

interface CreateLabelPageProps {
  params: Promise<{ projectId: string }>;
}

const INITIAL_ELEMENTS: CanvasElement[] = [
  {
    id: "elem-header",
    type: "text",
    title: "Header Title",
    content: "ABC LOGISTICS",
    subContent: "Fast · Secure · Worldwide",
    x: 20,
    y: 18,
    width: 250,
    height: 52,
    fontSize: "lg",
    fontWeight: "black",
  },
  {
    id: "elem-qr",
    type: "qr",
    title: "Tracking QR Code",
    content: "https://qrise.app/s/CR-10025",
    x: 285,
    y: 14,
    width: 85,
    height: 85,
  },
  {
    id: "elem-id",
    type: "text",
    title: "Shipment ID",
    content: "CR-10025",
    subContent: "AIR EXPRESS PRIORITY",
    x: 20,
    y: 92,
    width: 250,
    height: 48,
    fontSize: "xl",
    fontWeight: "black",
  },
  {
    id: "elem-line-1",
    type: "line",
    title: "Divider Line",
    content: "",
    x: 18,
    y: 150,
    width: 354,
    height: 2,
  },
  {
    id: "elem-from",
    type: "text",
    title: "Sender Address",
    content: "FROM: Chennai Warehouse",
    subContent: "123 Industrial Area\nChennai, TN 600001",
    x: 20,
    y: 162,
    width: 170,
    height: 72,
    fontSize: "xs",
  },
  {
    id: "elem-to",
    type: "text",
    title: "Recipient Address",
    content: "TO: John Doe",
    subContent: "456, MG Road\nBengaluru, KA 560001",
    x: 200,
    y: 162,
    width: 170,
    height: 72,
    fontSize: "xs",
  },
  {
    id: "elem-line-2",
    type: "line",
    title: "Divider Line",
    content: "",
    x: 18,
    y: 248,
    width: 354,
    height: 2,
  },
  {
    id: "elem-barcode",
    type: "barcode",
    title: "Shipping Barcode",
    content: "CR-10025",
    barcodeType: "Code 128",
    x: 25,
    y: 260,
    width: 340,
    height: 85,
  },
  {
    id: "elem-details",
    type: "table",
    title: "Package Grid",
    content: "Weight: 2.5 KG | Pieces: 1 | Route: MAA-BLR",
    x: 18,
    y: 360,
    width: 354,
    height: 38,
    fontSize: "xs",
  },
  {
    id: "elem-footer",
    type: "text",
    title: "Footer Instruction",
    content: "Scan QR or visit qrise.app/tracking for live delivery status",
    x: 20,
    y: 535,
    width: 350,
    height: 25,
    fontSize: "xs",
    align: "center",
  },
];

export default function CreateLabelPage({ params }: CreateLabelPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId || "courier-tracking";
  const projectName = projectId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const [labelName, setLabelName] = useState("Shipping Barcode Label");
  const [labelDescription, setLabelDescription] = useState("Standard 4x6 thermal shipping label template");
  
  // History stack for Canvas Undo / Redo
  const [history, setHistory] = useState<CanvasElement[][]>([INITIAL_ELEMENTS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const elements = history[historyIndex] || INITIAL_ELEMENTS;

  const pushState = (newElements: CanvasElement[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newElements);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      setHistoryIndex((prev) => prev - 1);
      toast.info("Reverted last canvas change");
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      setHistoryIndex((prev) => prev + 1);
      toast.info("Restored canvas change");
    }
  };

  // Keyboard shortcut listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          if (canRedo) handleRedo();
        } else {
          e.preventDefault();
          if (canUndo) handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (canRedo) handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo]);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<BottomToolType>("select");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isFramesOpen, setIsFramesOpen] = useState(false);
  const [activeFrame, setActiveFrame] = useState<LabelFramePreset | null>(null);
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());

  // Debounced auto-save effect
  useEffect(() => {
    if (!autoSave) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setLastSavedAt(new Date());
      }, 400);
    }, 1200);

    return () => clearTimeout(timer);
  }, [elements, labelName, labelDescription, activeFrame, autoSave]);

  // Canvas display preferences
  const [showGrid, setShowGrid] = useState(true);
  const [snapToElements, setSnapToElements] = useState(true);
  const [showMargins, setShowMargins] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const selectedElement = elements.find((e) => e.id === selectedElementId) || null;

  // Handle element selection on canvas
  const handleSelectElement = (element: CanvasElement | null) => {
    setSelectedElementId(element?.id || null);
  };

  // Handle adding an element from the Add Element sheet
  const handleAddElement = (type: ElementType) => {
    const newId = `elem-${Date.now()}`;
    let newElement: CanvasElement;

    switch (type) {
      case "text":
        newElement = { id: newId, type: "text", title: "Custom Text", content: "New Text Field", x: 40, y: 410, width: 220, height: 35, fontSize: "sm", fontWeight: "bold" };
        break;
      case "barcode":
        newElement = { id: newId, type: "barcode", title: "Barcode", content: "CR-99001", barcodeType: "Code 128", x: 25, y: 410, width: 340, height: 85 };
        break;
      case "qr":
        newElement = { id: newId, type: "qr", title: "QR Code", content: "https://qrise.app", x: 40, y: 410, width: 85, height: 85 };
        break;
      case "dynamic":
        newElement = { id: newId, type: "dynamic", title: "Dynamic Variable", content: "{{tracking_code}}", x: 40, y: 410, width: 200, height: 35, fontSize: "sm", fontWeight: "bold" };
        break;
      case "date":
        newElement = { id: newId, type: "date", title: "Print Date", content: `Date: ${new Date().toLocaleDateString()}`, x: 40, y: 410, width: 160, height: 30, fontSize: "xs" };
        break;
      case "table":
        newElement = { id: newId, type: "table", title: "Item Grid", content: "Items: 1 x Parcel (2.5kg)", x: 20, y: 410, width: 350, height: 40, fontSize: "xs" };
        break;
      case "line":
        newElement = { id: newId, type: "line", title: "Line", content: "", x: 20, y: 410, width: 350, height: 2 };
        break;
      case "rectangle":
        newElement = { id: newId, type: "rectangle", title: "Rectangle Box", content: "", x: 20, y: 410, width: 350, height: 80 };
        break;
      default:
        newElement = { id: newId, type: type, title: type.toUpperCase(), content: `Custom ${type}`, x: 40, y: 410, width: 180, height: 35 };
        break;
    }

    const nextElements = [...elements, newElement];
    pushState(nextElements);
    setSelectedElementId(newId);
    toast.success(`Added ${newElement.title} to label`);
  };

  // Handle adding a shape
  const handleAddShape = (shape: ShapeType) => {
    const newId = `shape-${Date.now()}`;
    let newElement: CanvasElement;

    switch (shape) {
      case "rectangle":
        newElement = { id: newId, type: "rectangle", title: "Rectangle Box", content: "", x: 30, y: 420, width: 330, height: 75 };
        break;
      case "line":
        newElement = { id: newId, type: "line", title: "Divider Line", content: "", x: 20, y: 420, width: 350, height: 2 };
        break;
      case "circle":
        newElement = { id: newId, type: "circle", title: "Stamp Badge", content: "AIR", x: 150, y: 420, width: 60, height: 60 };
        break;
      case "box":
        newElement = { id: newId, type: "box", title: "Dashed Box", content: "", x: 30, y: 420, width: 330, height: 75 };
        break;
      default:
        newElement = { id: newId, type: "rectangle", title: "Rectangle", content: "", x: 30, y: 420, width: 330, height: 75 };
        break;
    }

    const nextElements = [...elements, newElement];
    pushState(nextElements);
    setSelectedElementId(newId);
    toast.success(`Added ${newElement.title} to canvas`);
  };

  // Update element properties / position / size
  const handleUpdateElement = (updated: CanvasElement) => {
    const nextElements = elements.map((el) => (el.id === updated.id ? updated : el));
    pushState(nextElements);
  };

  // Duplicate an element
  const handleDuplicateElement = (element: CanvasElement) => {
    const newId = `elem-${Date.now()}`;
    const duplicated: CanvasElement = {
      ...element,
      id: newId,
      x: Math.min(element.x + 15, 300),
      y: Math.min(element.y + 15, 500),
    };
    const nextElements = [...elements, duplicated];
    pushState(nextElements);
    setSelectedElementId(newId);
    toast.success("Element duplicated");
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    const nextElements = elements.filter((el) => el.id !== id);
    pushState(nextElements);
    if (selectedElementId === id) setSelectedElementId(null);
    toast.info("Element removed from label");
  };

  // Save template
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Label template saved successfully!");
    }, 500);
  };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-[30px] h-[calc(100dvh-0px)] flex flex-col overflow-hidden bg-slate-100/60 dark:bg-slate-950 relative">
      {/* 1. Header Bar: Full Width at Top */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 shrink-0 z-20 shadow-2xs">
        <CreateLabelHeader
          labelName={labelName}
          onLabelNameChange={setLabelName}
          labelDescription={labelDescription}
          onLabelDescriptionChange={setLabelDescription}
          projectName={projectName}
          projectId={projectId}
          onSave={handleSave}
          isSaving={isSaving}
          autoSave={autoSave}
          onAutoSaveChange={setAutoSave}
          lastSavedAt={lastSavedAt}
        />
      </div>

      {/* 2. Floating & Fixed Undo / Redo Toolbar on Right Corner Below Header */}
      <div className="absolute top-[62px] right-4 sm:right-8 z-30 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 p-1 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/30 transition-all hover:border-emerald-500/50">
        <button
          type="button"
          onClick={handleUndo}
          disabled={!canUndo}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Undo (Ctrl+Z)"
          aria-label="Undo canvas change"
        >
          <Undo2 className="w-4 h-4 stroke-[2.2]" />
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 my-auto" />
        <button
          type="button"
          onClick={handleRedo}
          disabled={!canRedo}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          aria-label="Redo canvas change"
        >
          <Redo2 className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* 3. Full-bleed Interactive Printable Canvas Studio (Takes full height & width except header) */}
      <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden flex flex-col">
        <LabelCanvas
          elements={elements}
          selectedElementId={selectedElementId}
          onSelectElement={handleSelectElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onOpenProperties={() => setIsPropertiesOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          showGrid={showGrid}
          snapToElements={snapToElements}
          showMargins={showMargins}
          zoom={zoom}
          setZoom={setZoom}
          pan={pan}
          setPan={setPan}
          labelWidth={activeFrame?.width || 390}
          labelHeight={activeFrame?.height || 580}
          hasFrame={Boolean(activeFrame)}
          onOpenFrames={() => setIsFramesOpen(true)}
        />
      </div>

      {/* 4. Center Floating Bottom Toolbar (5 Icons: selector, frames, add, shapes, preview) */}
      <CanvasBottomToolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onOpenFrames={() => setIsFramesOpen(true)}
        onOpenAdd={() => setIsAddSheetOpen(true)}
        onOpenShapes={() => setIsShapesOpen(true)}
        onOpenPreview={() => setIsPrintPreviewOpen(true)}
        hasSelectedElement={Boolean(selectedElementId)}
        onOpenProperties={() => setIsPropertiesOpen(true)}
      />

      {/* 5. Frames & Sizes Dialog / Sheet */}
      <FramesDialog
        open={isFramesOpen}
        onOpenChange={setIsFramesOpen}
        activeFrame={activeFrame}
        onSelectFrame={(frame) => {
          setActiveFrame(frame);
          toast.success(`Frame set: ${frame.name} (${frame.inches})`);
        }}
        onDeleteFrame={() => {
          setActiveFrame(null);
          toast.info("Frame removed from canvas");
        }}
      />

      {/* 6. Add Element Bottom Sheet */}
      <AddElementSheet
        open={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAddElement={handleAddElement}
      />

      {/* 7. Shape Picker Dialog */}
      <ShapesDialog
        open={isShapesOpen}
        onOpenChange={setIsShapesOpen}
        onSelectShape={handleAddShape}
      />

      {/* 8. Thermal Print & Preview Dialog */}
      <PrintPreviewDialog
        open={isPrintPreviewOpen}
        onOpenChange={setIsPrintPreviewOpen}
        labelName={labelName}
        elements={elements}
      />

      {/* 9. Element Properties & Typography Sheet (MS Word Mobile Style) */}
      <ElementPropertiesSheet
        element={selectedElement}
        open={isPropertiesOpen}
        onClose={() => setIsPropertiesOpen(false)}
        onUpdate={handleUpdateElement}
        onDelete={handleDeleteElement}
      />

      {/* 10. Canvas Settings Dialog (Top-Left Settings Icon) */}
      <CanvasSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        showGrid={showGrid}
        onToggleGrid={setShowGrid}
        snapToElements={snapToElements}
        onToggleSnap={setSnapToElements}
        showMargins={showMargins}
        onToggleMargins={setShowMargins}
        onResetZoom={() => setZoom(100)}
        onResetPan={() => setPan({ x: 0, y: 0 })}
        zoom={zoom}
      />
    </div>
  );
}
