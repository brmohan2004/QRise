"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { BuilderCanvas } from "@/components/form-builder/builder-canvas";
import { FieldSettingsPanel } from "@/components/form-builder/field-settings-panel";
import { FormPreview } from "@/components/form-builder/form-preview";
import { FieldPalette, paletteItems } from "@/components/form-builder/field-palette";
import { FormBuilderHeader } from "@/components/form-builder/header";
import { QRWorkflowDialog } from "@/components/form-builder/qr-workflow-dialog";
import { QRSavePrompt } from "@/components/form-builder/qr-save-prompt";
import { ShareDialog } from "@/components/form-builder/share-dialog";
import { QRPreviewHandle } from "@/components/qr/qr-preview";
import { FormField, FieldType } from "@/types/form.types";
import { cn } from "@/lib/utils";

interface FormBuilderProps {
  initialData?: {
    id?: string;
    name: string;
    fields: FormField[];
  };
  onClose: () => void;
}

export function FormBuilder({ initialData, onClose }: FormBuilderProps) {
  const [formName, setFormName] = useState(initialData?.name || "Untitled Form");
  const [fields, setFields] = useState<FormField[]>(initialData?.fields || []);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showQRPrompt, setShowQRPrompt] = useState(false);
  const [showQRWorkflow, setShowQRWorkflow] = useState(false);
  const [savedFormId, setSavedFormId] = useState<string | null>(initialData?.id || null);
  const [qrWorkflowStep, setQRWorkflowStep] = useState(1);
  const shareQRRef = useRef<QRPreviewHandle>(null);

  // Resize State
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(350);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const startResizingLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingLeft(true);
  }, []);

  const startResizingRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingRight(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = e.clientX;
        if (newWidth > 200 && newWidth < 500) setLeftWidth(newWidth);
      } else if (isResizingRight) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 280 && newWidth < 600) setRightWidth(newWidth);
      }
    },
    [isResizingLeft, isResizingRight]
  );

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizingLeft, isResizingRight, resize, stopResizing]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: `Enter ${type}...`,
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
    setIsPaletteOpen(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.data.current?.type && !fields.find(f => f.id === active.id)) {
      addField(active.data.current.type as FieldType);
      return;
    }

    if (active.id !== over?.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(f => f.id === active.id);
        const newIndex = items.findIndex(f => f.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    if (fields.length === 0) {
      toast.error("Please add at least one field to your form.");
      return;
    }

    setIsSaving(true);
    try {
      const url = savedFormId ? `/api/forms/${savedFormId}` : "/api/forms";
      const method = savedFormId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, fields }),
      });

      if (!response.ok) throw new Error("Failed to save form");

      const data = await response.json();
      const formId = data.id || savedFormId;
      setSavedFormId(formId);

      toast.success(savedFormId ? "Form updated!" : "Form saved successfully!");
      setShowQRPrompt(true);
    } catch (_err) {
      toast.error("Error saving form. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50/50">
      <FormBuilderHeader 
        onClose={onClose}
        formName={formName}
        setFormName={setFormName}
        onPreview={() => setIsPreviewOpen(true)}
        onSave={handleSave}
        onShare={() => setIsShareOpen(true)}
        isSaving={isSaving}
        savedFormId={savedFormId || undefined}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Left Palette (Desktop Only) */}
          <div className="hidden lg:block h-full border-r border-gray-100 bg-white" style={{ width: leftWidth }}>
            <FieldPalette 
              leftWidth={leftWidth}
              startResizingLeft={startResizingLeft}
              isResizingLeft={isResizingLeft}
            />
          </div>

          {/* Mobile Palette FAB */}
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
              <Button
                size="icon"
                className="h-14 w-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
                onClick={() => setIsPaletteOpen(true)}
              >
                <Plus className="h-6 w-6 text-white" />
              </Button>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-[2rem] p-0 border-none bg-white">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                      <Plus className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Add Element</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">Drag or tap to add</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {paletteItems.map((item) => (
                      <button
                        key={item.type}
                        onClick={() => addField(item.type)}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-emerald-500/30 hover:bg-emerald-50/10 transition-all text-left group shadow-sm active:scale-[0.98]"
                      >
                        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-emerald-50 transition-colors border border-gray-50 group-hover:border-emerald-100">
                          <item.icon className="h-5 w-5 text-gray-400 group-hover:text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-black text-gray-600 group-hover:text-emerald-900 uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-16 bg-gray-50/50">
            <BuilderCanvas
              fields={fields}
              selectedId={selectedFieldId}
              onSelect={(id) => {
                setSelectedFieldId(id);
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setIsSettingsOpen(true);
                }
              }}
              onDelete={(id) => {
                setFields(prev => prev.filter(f => f.id !== id));
                if (selectedFieldId === id) setSelectedFieldId(null);
              }}
            />
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-2xl w-[300px] opacity-95 scale-105 transition-transform font-black text-emerald-600 uppercase tracking-widest text-[10px]">
                Placing element...
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Right Settings Panel (Desktop) */}
        <div 
          className="hidden lg:block border-l border-gray-100 bg-white shrink-0 overflow-y-auto relative"
          style={{ width: `${rightWidth}px` }}
        >
          <div
            onMouseDown={startResizingRight}
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50 transition-all duration-200 hover:bg-emerald-600/20",
              isResizingRight && "bg-emerald-600/40 border-emerald-600/50 w-2"
            )}
          >
            <div className="absolute inset-y-0 left-0 w-[1px] bg-gray-100" />
          </div>
          <FieldSettingsPanel
            field={selectedField}
            onUpdate={(updates) => selectedFieldId && setFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f))}
            onClose={() => setSelectedFieldId(null)}
          />
        </div>

        {/* Mobile Settings Panel (Sheet) */}
        <Sheet 
          open={isSettingsOpen && !!selectedField} 
          onOpenChange={(open) => {
            setIsSettingsOpen(open);
            if (!open) setSelectedFieldId(null);
          }}
        >
          <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] p-0 border-none bg-white">
            <div className="h-full overflow-y-auto">
              <FieldSettingsPanel
                field={selectedField}
                showClose={false}
                onUpdate={(updates) => selectedFieldId && setFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f))}
                onClose={() => {
                  setIsSettingsOpen(false);
                  setSelectedFieldId(null);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <FormPreview isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} fields={fields} name={formName} />
      
      <ShareDialog 
        isOpen={isShareOpen} 
        onClose={setIsShareOpen} 
        savedFormId={savedFormId} 
        formName={formName} 
        qrRef={shareQRRef} 
      />

      <QRSavePrompt 
        isOpen={showQRPrompt} 
        onClose={setShowQRPrompt} 
        savedFormId={savedFormId || undefined}
        onOpenWorkflow={() => { setShowQRPrompt(false); setQRWorkflowStep(1); setShowQRWorkflow(true); }}
      />

      <QRWorkflowDialog 
        isOpen={showQRWorkflow} 
        onClose={setShowQRWorkflow} 
        step={qrWorkflowStep} 
        setStep={setQRWorkflowStep} 
        savedFormId={savedFormId || undefined}
      />
    </div>
  );
}
