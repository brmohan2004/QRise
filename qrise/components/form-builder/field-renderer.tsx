"use client";

import { FormField } from "@/types/form.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, FileUp, Signature, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SignaturePad } from "./signature-pad";

import { toast } from "sonner";

interface FieldRendererProps {
  field: FormField;
  interactive?: boolean;
  value?: any;
  onChange?: (value: any) => void;
}

export function FieldRenderer({ field, interactive = false, value, onChange }: FieldRendererProps) {
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);

  const commonProps = {
    disabled: !interactive,
    placeholder: field.placeholder,
    value: value || "",
    onChange: (e: any) => onChange?.(e.target.value),
  };

  const LabeledField = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-bold text-slate-900">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {children}
      {field.helperText && (
        <p className="text-[11px] text-slate-400 font-medium">
          {field.helperText}
        </p>
      )}
    </div>
  );

  switch (field.type) {
    case "text":
    case "email":
    case "phone":
      return (
        <LabeledField>
          <Input type={field.type === 'phone' ? 'tel' : field.type} {...commonProps} className="bg-slate-50/50 border-slate-200" />
        </LabeledField>
      );
    
    case "textarea":
      return (
        <LabeledField>
          <div className="relative group">
            <Textarea 
              {...commonProps} 
              className="bg-slate-50/50 border-slate-200 min-h-[120px] rounded-2xl p-4 focus:bg-white transition-all resize-none" 
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-300 group-focus-within:text-[#0F6E56]/40 uppercase tracking-widest pointer-events-none">
              Long Text
            </div>
          </div>
        </LabeledField>
      );

    case "dropdown":
      return (
        <LabeledField>
          <Select 
            disabled={!interactive} 
            value={value} 
            onValueChange={(val) => onChange?.(val)}
          >
            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0F6E56]/20">
              <SelectValue placeholder={field.placeholder || "Select an option..."} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {field.options?.map((opt, i) => (
                <SelectItem key={i} value={opt} className="rounded-lg py-2.5">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </LabeledField>
      );

    case "checkbox":
      return (
        <LabeledField>
          <div className="space-y-3 pt-1">
            {field.options && field.options.length > 0 ? field.options.map((opt, i) => {
              const currentValues = Array.isArray(value) ? value : [];
              const isChecked = currentValues.includes(opt);
              
              return (
                <div key={i} className="flex items-center gap-3 group cursor-pointer" onClick={() => {
                  if (!interactive) return;
                  const newValues = isChecked 
                    ? currentValues.filter(v => v !== opt)
                    : [...currentValues, opt];
                  onChange?.(newValues);
                }}>
                  <Checkbox 
                    id={`${field.id}-${i}`} 
                    checked={isChecked}
                    disabled={!interactive}
                    onCheckedChange={(checked) => {
                      const newValues = checked 
                        ? [...currentValues, opt]
                        : currentValues.filter(v => v !== opt);
                      onChange?.(newValues);
                    }}
                    className="data-[state=checked]:bg-[#0F6E56] data-[state=checked]:border-[#0F6E56] rounded-md transition-all"
                  />
                  <label className="text-sm font-medium text-slate-700 group-hover:text-slate-900 cursor-pointer transition-colors">{opt}</label>
                </div>
              );
            }) : (
               <div className="flex items-center gap-3 italic text-slate-400 text-xs">
                 No options defined
               </div>
            )}
          </div>
        </LabeledField>
      );

    case "date":
      return (
        <LabeledField>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 rounded-lg group-hover:bg-[#0F6E56]/10 transition-colors pointer-events-none z-10">
              <CalendarIcon className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0F6E56] transition-colors" />
            </div>
            <Input
              type="date"
              {...commonProps}
              className="bg-slate-50/50 border-slate-200 pl-12 h-11 rounded-xl focus:bg-white transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </LabeledField>
      );

    case "file":
      return (
        <LabeledField>
          <label 
            className={cn(
              "border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50/50 flex flex-col items-center justify-center gap-2 text-slate-400 transition-all",
              interactive && "cursor-pointer hover:border-[#0F6E56]/30 hover:bg-[#0F6E56]/5"
            )}
          >
            <input
              type="file"
              className="hidden"
              disabled={!interactive}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const maxSizeMB = field.config?.maxFileSize || 5;
                  if (file.size > maxSizeMB * 1024 * 1024) {
                    toast.error(`File is too large. Maximum size is ${maxSizeMB}MB.`);
                    return;
                  }
                  onChange?.(file.name);
                }
              }}
            />
            <FileUp className={cn("h-8 w-8 mb-1", value && "text-[#0F6E56]")} />
            <span className={cn("text-sm font-bold", value && "text-[#0F6E56]")}>
              {value || "Drop files here or click to upload"}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
              Max size: {field.config?.maxFileSize || 5}MB
            </span>
          </label>
        </LabeledField>
      );

    case "signature":
      return (
        <LabeledField>
          <div 
            onClick={() => interactive && setIsSignatureOpen(true)}
            className={cn(
              "border border-slate-200 rounded-xl bg-slate-50/50 h-[120px] flex items-center justify-center relative overflow-hidden transition-all",
              interactive && "cursor-pointer hover:border-[#0F6E56]/30 hover:bg-[#0F6E56]/5"
            )}
          >
            {value ? (
              <div className="relative w-full h-full p-4 flex items-center justify-center">
                <img src={value} alt="Signature" className="max-h-full max-w-full object-contain" />
                {interactive && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 h-6 w-6 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 shadow-sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onChange?.("");
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="absolute inset-x-4 bottom-8 h-px bg-slate-200" />
                <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest relative z-10">
                  {interactive ? "Click to Sign" : "Sign Here"}
                </span>
                <Signature className="absolute right-4 top-4 h-4 w-4 text-slate-200" />
              </>
            )}
          </div>
          {interactive && (
            <SignaturePad
              isOpen={isSignatureOpen}
              onClose={() => setIsSignatureOpen(false)}
              onSave={(sig) => onChange?.(sig)}
            />
          )}
        </LabeledField>
      );

    default:
      return null;
  }
}
