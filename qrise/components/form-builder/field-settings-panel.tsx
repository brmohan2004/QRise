"use client";

import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Type,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Hash,
  ToggleLeft,
  CheckSquare,
  ChevronDown,
  FileText,
  Sparkles,
  AlertCircle,
  FileUp,
  Signature
} from "lucide-react";
import { FormField } from "@/types/form.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FieldSettingsPanelProps {
  field: FormField | undefined;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
}

const fieldTypeIcons: Record<string, React.ElementType> = {
  text: Type,
  email: Mail,
  phone: Phone,
  date: Calendar,
  address: MapPin,
  url: Globe,
  number: Hash,
  toggle: ToggleLeft,
  checkbox: CheckSquare,
  dropdown: ChevronDown,
  textarea: FileText,
  file: FileUp,
  signature: Signature,
};

const fieldTypeNames: Record<string, string> = {
  text: "Text Input",
  email: "Email",
  phone: "Phone",
  date: "Date",
  address: "Address",
  url: "URL",
  number: "Number",
  toggle: "Toggle",
  checkbox: "Checkbox",
  dropdown: "Dropdown",
  textarea: "Text Area",
  file: "File Upload",
  signature: "Signature",
};

function FieldTypeIcon({ type, className }: { type: string; className?: string }) {
  const Icon = fieldTypeIcons[type] || Type;
  return <Icon className={className} />;
}

export function FieldSettingsPanel({ field, onUpdate, onClose }: FieldSettingsPanelProps) {
  if (!field) return null;

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const addOption = () => {
    onUpdate({ options: [...(field.options || []), `Option ${(field.options || []).length + 1}`] });
  };

  const removeOption = (index: number) => {
    onUpdate({ options: (field.options || []).filter((_, i) => i !== index) });
  };

  const fieldName = fieldTypeNames[field.type] || "Field";

  return (
    <aside className="w-full bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-300 overflow-hidden h-full">
      {/* Header with gradient accent bar */}
      <div className="relative overflow-hidden shrink-0">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0F6E56] via-[#14a085] to-[#0F6E56]" />
        <div className="h-20 border-b flex items-center justify-between px-5 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F6E56] to-[#0d5a48] flex items-center justify-center shadow-sm">
              <FieldTypeIcon type={field.type} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{fieldName}</h3>
              <p className="text-xs text-slate-400 font-medium">Field Settings</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto lg:overflow-y-auto p-4 space-y-4">
        {/* Basic Info Card */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Basic Info</h4>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Field Label</Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="font-medium border-slate-200 bg-slate-50/50 focus:border-[#0F6E56] focus:ring-[#0F6E56]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Placeholder Text</Label>
              <Input
                value={field.placeholder || ""}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="border-slate-200 bg-slate-50/50 focus:border-[#0F6E56] focus:ring-[#0F6E56]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Helper Text</Label>
              <Textarea
                value={field.helperText || ""}
                onChange={(e) => onUpdate({ helperText: e.target.value })}
                className="border-slate-200 bg-slate-50/50 text-sm min-h-[70px] focus:border-[#0F6E56] focus:ring-[#0F6E56]/20 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Validation Card - Prominent styling */}
        <div className="rounded-2xl border-2 border-[#0F6E56]/20 bg-gradient-to-br from-[#0F6E56]/5 to-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-[#0F6E56]/10 border-b border-[#0F6E56]/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F6E56]">Validation</h4>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-slate-900">Required Field</Label>
                <p className="text-xs text-slate-400 font-medium">User must fill this to submit</p>
              </div>
              <Switch
                checked={field.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
                className="data-[state=checked]:bg-[#0F6E56]"
              />
            </div>
          </div>
        </div>

        {/* File Settings Card */}
        {field.type === "file" && (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">File Settings</h4>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-600">Max File Size (MB)</Label>
                  <span className="text-[10px] font-bold text-[#0F6E56] bg-[#0F6E56]/10 px-2 py-0.5 rounded-full">
                    {field.config?.maxFileSize || 5} MB
                  </span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={field.config?.maxFileSize || 5}
                  onChange={(e) => onUpdate({ 
                    config: { 
                      ...field.config, 
                      maxFileSize: parseInt(e.target.value) || 5 
                    } 
                  })}
                  className="font-medium border-slate-200 bg-slate-50/50 focus:border-[#0F6E56] focus:ring-[#0F6E56]/20 transition-all"
                />
                <p className="text-[10px] text-slate-400 font-medium"> Set the maximum allowed file size in Megabytes.</p>
              </div>
            </div>
          </div>
        )}

        {/* Options Card - Enhanced UI */}
        {(field.type === "dropdown" || field.type === "checkbox") && (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Options</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={addOption}
                className="h-7 px-3 text-xs font-semibold text-[#0F6E56] hover:text-[#0d5a48] hover:bg-[#0F6E56]/10 transition-colors rounded-lg"
              >
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                {(field.options || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <div className="p-1.5 cursor-grab opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-slate-400">
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                    <Input
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      className="h-10 font-medium text-sm border-slate-200 focus:border-[#0F6E56] focus:ring-[#0F6E56]/20 transition-all"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(i)}
                      className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(field.options || []).length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed rounded-xl border-slate-100 bg-slate-50/30">
                    <p className="text-xs text-slate-400 font-medium">No options added yet</p>
                    <p className="text-[10px] text-slate-300 mt-1">Click "Add" to create options</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Card - Premium look */}
        <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">Advanced</h4>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Pro Feature</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Advanced validation rules (regex, ranges, file types) are available on Pro plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}