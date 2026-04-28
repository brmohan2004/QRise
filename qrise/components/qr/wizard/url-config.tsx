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

const URLSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetUrl: z.string().url("Please enter a valid URL").refine((url) => {
    return url.startsWith("http://") || url.startsWith("https://");
  }, "URL must start with http:// or https://"),
});

type URLFormData = z.infer<typeof URLSchema>;

export function URLConfig() {
  const { config, name: wizardName, setName, setConfig, editingQrId, setEditingQrId } = useWizardStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showUTM, setShowUTM] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<URLFormData>({
    resolver: zodResolver(URLSchema),
    defaultValues: {
      name: wizardName || "",
      targetUrl: (config as any)?.targetUrl || "",
    },
  });

  const targetUrl = watch("targetUrl");

  // Build UTM appends
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  const finalUrl = targetUrl && [
    targetUrl,
    utmSource && `utm_source=${encodeURIComponent(utmSource)}`,
    utmMedium && `utm_medium=${encodeURIComponent(utmMedium)}`,
    utmCampaign && `utm_campaign=${encodeURIComponent(utmCampaign)}`,
  ].filter(Boolean).join(targetUrl.includes("?") ? "&" : "?");

  // Sync form to store for live preview
  useEffect(() => {
    if (targetUrl) {
      setConfig({ targetUrl: finalUrl || targetUrl });
    }
  }, [targetUrl, finalUrl, setConfig]);

  // Sync store to form (for editing)
  useEffect(() => {
    if (editingQrId) {
      reset({
        name: wizardName || "",
        targetUrl: (config as any)?.targetUrl || "",
      });
    }
  }, [editingQrId, wizardName, config, reset]);

  const onSubmit = async (data: URLFormData) => {
    setLoading(true);
    setName(data.name);
    const newConfig = {
      type: "url" as const,
      targetUrl: finalUrl || data.targetUrl,
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

      if (!response.ok) throw new Error("Failed to save to storage");

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">URL QR Code</h2>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
          Enter the destination URL where your QR code will redirect users.
        </p>
      </div>

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
          <label htmlFor="targetUrl" className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-1">
            Destination URL
          </label>
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
          {errors.targetUrl && (
            <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.targetUrl.message}</p>
          )}
        </div>
      </div>

      {/* UTM Builder Accordion */}
      <div>
        <button
          type="button"
          onClick={() => setShowUTM(!showUTM)}
          className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-full"
        >
          {showUTM ? "− Hide" : "+ Show"} UTM Builder
        </button>

        {showUTM && (
          <div className="mt-4 space-y-4 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black tracking-widest text-emerald-600/60 ml-1">Source</label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="google"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black tracking-widest text-emerald-600/60 ml-1">Medium</label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="qr"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black tracking-widest text-emerald-600/60 ml-1">Campaign</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="spring_sale"
                />
              </div>
            </div>
            {finalUrl && (
              <div className="mt-2 pt-3 border-t border-emerald-100">
                <p className="text-[9px] uppercase font-black tracking-widest text-emerald-600/60 mb-1">Generated URL:</p>
                <p className="text-xs text-emerald-700 break-all font-mono bg-white p-2 rounded border border-emerald-100">{finalUrl}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full h-12 flex items-center justify-center bg-gray-900 text-white rounded-xl font-bold overflow-hidden transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-10 transition-opacity" />
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center gap-2">
            Save & Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}