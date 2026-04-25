"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField } from "@/types/form.types";
import { FieldRenderer } from "./field-renderer";
import { Button } from "@/components/ui/button";

interface SortableFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableField({ field, isSelected, onSelect, onDelete }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(field.id)}
      className={cn(
        "group relative bg-white border-2 rounded-xl p-6 transition-all cursor-pointer mb-4",
        isSelected ? "border-[#0F6E56] shadow-md ring-4 ring-[#0F6E56]/10" : "border-slate-100 hover:border-[#0F6E56]/30",
        isDragging && "opacity-50 grayscale"
      )}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div {...listeners} {...attributes} className="p-2 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-[#0F6E56]"
          onClick={(e) => { e.stopPropagation(); onSelect(field.id); }}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-red-600"
          onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <FieldRenderer field={field} />
    </div>
  );
}

interface BuilderCanvasProps {
  fields: FormField[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BuilderCanvas({ fields, selectedId, onSelect, onDelete }: BuilderCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-full max-w-[900px] min-h-[500px] mx-auto rounded-3xl border-4 border-dashed transition-colors p-8",
        isOver ? "bg-[#0F6E56]/5 border-[#0F6E56]/30" : "bg-transparent border-slate-200"
      )}
    >
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[500px] text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <GripVertical className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-600">Start Building Your Form</h3>
          <p className="text-slate-400 max-w-[280px] mx-auto mt-2">
            Drag fields from the palette on the left and drop them here to begin.
          </p>
        </div>
      ) : (
        <SortableContext
          items={fields.map(f => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field) => (
            <SortableField
              key={field.id}
              field={field}
              isSelected={selectedId === field.id}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
}
