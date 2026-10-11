"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { AlertCircle } from "lucide-react";

const URLSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetUrl: z.string().min(1, "Target is required"),
  destinationType: z.enum(["url", "text"]),
});

interface URLFormData {
  name: string;
  targetUrl: string;
  destinationType: 'url' | 'text';
}

export function URLConfig() {
  const { config, name: wizardName, setName, setConfig, editingQrId, setEditingQrId } = useWizardStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showUTM, setShowUTM] = useState(false);
  const { data: usage } = useUsageStats();
  const isLimitReached = !!usage && usage.metrics.dynamicQrs.limit !== -1 && usage.metrics.dynamicQrs.current >= usage.metrics.dynamicQrs.limit && !editingQrId;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<URLFormData>({
    resolver: zodResolver(URLSchema) as any,
    defaultValues: {
      name: wizardName || "",
      targetUrl: (config as any)?.targetUrl || "",
      destinationType: (config as any)?.destinationType || "url",
    },
  });

  const destinationType = watch("destinationType");

  // Auto-sync form inputs to wizard store on every change
  useEffect(() => {
    const subscription = watch((val) => {
      if (val.name !== undefined) {
        setName(val.name);
      }
      if (val.targetUrl !== undefined || val.destinationType !== undefined) {
        setConfig({
          type: "url",
          targetUrl: val.targetUrl || "",
          destinationType: val.destinationType || "url",
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setName, setConfig]);

  // Sync store to form (for editing)
  useEffect(() => {
    if (editingQrId) {
      reset({
        name: wizardName || "",
        targetUrl: (config as any)?.targetUrl || "",
        destinationType: (config as any)?.destinationType || "url",
      });
    }
  }, [editingQrId, wizardName, config, reset]);

  const onSubmit = async (data: URLFormData) => {
    setLoading(true);
    setName(data.name);
    const newConfig = {
      type: "url" as const,
      targetUrl: data.targetUrl,
      destinationType: data.destinationType,
    };
    setConfig(newConfig);

    try {
      const isEditing = !!editingQrId;
      const url = isEditing ? `/api/qr/${editingQrId}` : "/api/qr";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          type: "url",
          config: newConfig,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to save to storage");
      }

      const resData = await response.json();
      if (!isEditing && resData.data?.id) {
        setEditingQrId(resData.data.id);
        // Sync the full saved QR back to the store (includes shortCode)
        setConfig(resData.data);
      }

      toast.success("Configuration saved to storage");
    } catch (e: any) {
      toast.error(e.message || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-1">
            QR Name
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className={cn(
              "block w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl transition-all outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
              errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
            )}
            placeholder="e.g. Website Home Page"
          />
          {errors.name && (
            <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="targetUrl" className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-1">
              {destinationType === 'url' ? "Destination URL" : "Text Content"}
            </label>
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button 
                type="button"
                onClick={() => setValue('destinationType', 'url')}
                className={cn("px-3 py-1 text-[10px] rounded-md transition-all font-black uppercase tracking-widest", destinationType === 'url' ? "bg-white shadow-sm text-emerald-600" : "text-gray-400")}
              >URL</button>
              <button 
                type="button"
                onClick={() => setValue('destinationType', 'text')}
                className={cn("px-3 py-1 text-[10px] rounded-md transition-all font-black uppercase tracking-widest", destinationType === 'text' ? "bg-white shadow-sm text-emerald-600" : "text-gray-400")}
              >Text</button>
            </div>
          </div>
          
          {destinationType === 'url' ? (
            <input
              id="targetUrl"
              type="url"
              {...register("targetUrl")}
              className={cn(
                "block w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl transition-all outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                errors.targetUrl ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
              )}
              placeholder="https://example.com"
            />
          ) : (
            <textarea
              id="targetUrl"
              {...register("targetUrl")}
              className={cn(
                "block w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl transition-all outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
                errors.targetUrl ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
              )}
              placeholder="Enter text to display when scanned..."
              rows={4}
            />
          )}
          {errors.targetUrl && (
            <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.targetUrl.message}</p>
          )}
        </div>
      </div>

      {isLimitReached && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none">Quota Reached</span>
            <span className="text-xs font-bold text-rose-500 mt-1">You have reached the limit for dynamic QR codes.</span>
          </div>
          <Link href="/billing" className="ml-auto text-[10px] font-black text-rose-600 uppercase underline decoration-rose-200">Upgrade</Link>
        </div>
      )}
    </form>
  );
}