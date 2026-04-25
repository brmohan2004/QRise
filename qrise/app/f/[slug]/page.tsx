"use client";

import { use, useState, useEffect, useMemo } from "react";
import { FieldRenderer } from "@/components/form-builder/field-renderer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/types/form.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PublicFormPage({ params: paramsPromise }: PageProps) {
  const params = use(paramsPromise);
  const [form, setForm] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`/api/f/${params.slug}`);
        if (!res.ok) throw new Error("Form not found");
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchForm();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${form.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }

      setIsSubmitted(true);
      toast.success("Form submitted successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const fields = useMemo(() => {
    if (!form?.fieldsSchema) return [];
    const rawFields = (typeof form.fieldsSchema === 'string'
      ? JSON.parse(form.fieldsSchema)
      : form.fieldsSchema) || [];
    return Array.isArray(rawFields) ? rawFields : [];
  }, [form?.fieldsSchema]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Form Not Found</h1>
        <p className="text-slate-500 font-medium max-w-xs">The form you're looking for doesn't exist or has been disabled.</p>
      </div>
    );
  }

  if (form.isActive === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Form Closed</h1>
        <p className="text-slate-500 font-medium max-w-xs">This form is no longer accepting responses.</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-full mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">Submission Successful</h1>
            <p className="text-slate-500 font-medium">
              {form.successMessage || "Thank you for your response! We've received your submission."}
            </p>
          </div>
          <div className="pt-4 flex flex-col items-center gap-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Powered by</span>
              <span className="text-xs font-black tracking-tight text-slate-900 underline decoration-indigo-500 decoration-2 underline-offset-2">QRise</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Form Not Ready</h1>
        <p className="text-slate-500 font-medium max-w-xs">This form doesn't have any fields yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 h-3 w-full" />
        <div className="p-10 sm:p-12">
          <h1 className="text-3xl font-black text-slate-900 mb-4">{form.name}</h1>
          <p className="text-sm font-medium text-slate-400 mb-10">Please fill out the form below.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {fields.map((field: FormField) => (
              <FieldRenderer
                key={field.id}
                field={field}
                interactive={true}
                value={formData[field.id]}
                onChange={(val) => updateFormData(field.id, val)}
              />
            ))}

            <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-8">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Submitting..." : "Submit Response"}
              </Button>

              <div className="flex items-center gap-2 text-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-widest italic">Powered by</span>
                <span className="text-xs font-black tracking-tight text-slate-900 underline decoration-indigo-500 decoration-2 underline-offset-2">QRise</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}