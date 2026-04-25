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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">URL QR Code</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create a standard QR code that links to a URL
        </p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          QR Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={cn(
            "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
            errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#0F6E56]"
          )}
          placeholder="My QR Code"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700">
          Destination URL
        </label>
        <input
          id="targetUrl"
          type="url"
          {...register("targetUrl")}
          className={cn(
            "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
            errors.targetUrl ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#0F6E56]"
          )}
          placeholder="https://example.com"
        />
        {errors.targetUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.targetUrl.message}</p>
        )}
      </div>

      {/* UTM Builder Accordion */}
      <button
        type="button"
        onClick={() => setShowUTM(!showUTM)}
        className="text-sm text-[#0F6E56] hover:underline"
      >
        {showUTM ? "Hide" : "Show"} UTM Builder
      </button>

      {showUTM && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-xs text-gray-500">UTM Source</label>
            <input
              type="text"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="google"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">UTM Medium</label>
            <input
              type="text"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="qr"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">UTM Campaign</label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="spring_sale"
            />
          </div>
          {finalUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">Preview URL:</p>
              <p className="text-xs text-gray-700 break-all">{finalUrl}</p>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-[#0F6E56] text-white rounded-lg font-medium hover:bg-[#0d5c48] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Save Configuration"}
      </button>
    </form>
  );
}