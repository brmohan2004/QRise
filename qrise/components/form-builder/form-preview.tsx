"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { FormField } from "@/types/form.types";
import { FieldRenderer } from "./field-renderer";
import { Button } from "@/components/ui/button";

interface FormPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FormField[];
  name: string;
}

export function FormPreview({ isOpen, onClose, fields, name }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Form submitted successfully (Preview Mode)!");
    setIsSubmitting(false);
    setTimeout(onClose, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 border-none rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <DialogHeader className="bg-[#0F6E56] text-white p-8 space-y-2 shrink-0">
          <DialogTitle className="text-2xl font-bold">{name}</DialogTitle>
          <DialogDescription className="text-white/70 font-medium">
            This is a preview of how your live form will look to responders.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-10 bg-white">
          <div className="space-y-8">
            {fields.length === 0 ? (
              <div className="text-center py-20 text-gray-400 italic font-medium">
                Add some fields to see a preview.
              </div>
            ) : (
              fields.map((field) => (
                <FieldRenderer 
                  key={field.id} 
                  field={field} 
                  interactive={true} 
                  value={formData[field.id]}
                  onChange={(val) => setFormData(prev => ({ ...prev, [field.id]: val }))}
                />
              ))
            )}
          </div>
          
          <div className="mt-12 pt-8 border-t flex flex-col items-center gap-6">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || fields.length === 0}
              className="w-full h-12 text-base font-bold bg-[#0F6E56] hover:bg-[#0d5c48] rounded-xl shadow-lg shadow-[#0F6E56]/20"
            >
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
            
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Powered by</span>
              <span className="text-xs font-bold tracking-tight text-gray-900 underline decoration-[#0F6E56] decoration-2 underline-offset-2">QRise</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
