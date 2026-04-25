"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const PasswordSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetUrl: z.string().url("Please enter a valid URL"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof PasswordSchema>;

function getPasswordStrength(password: string): { label: string; color: "red" | "amber" | "green" | "gray"; score: number } {
  if (!password) return { label: "None", color: "gray", score: 0 };
  if (password.length < 4) return { label: "Weak", color: "red", score: 1 };
  
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 1) return { label: "Weak", color: "red", score };
  if (score <= 2) return { label: "Medium", color: "amber", score };
  return { label: "Strong", color: "green", score };
}

const colorMap = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  gray: "bg-gray-200",
};

export function PasswordConfig() {
  const { name, setName, setConfig, config, editingQrId, setEditingQrId, setTempPassword, tempPassword } = useWizardStore();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      name: name || "",
      targetUrl: (config as any)?.targetUrl || "",
      password: tempPassword || "",
      confirmPassword: tempPassword || "",
    },
  });

  // Sync store to form (for editing)
  useEffect(() => {
    if (editingQrId) {
      reset({
        name: name || "",
        targetUrl: (config as any)?.targetUrl || "",
        password: tempPassword || "",
        confirmPassword: tempPassword || "",
      });
    }
  }, [editingQrId, name, config, reset, tempPassword]);

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const strength = getPasswordStrength(password);

  const onSubmit = async (data: PasswordFormData) => {
    setLoading(true);
    setName(data.name);
    // SECURITY FIX: Store config WITHOUT password - password stored in tempPassword (NOT persisted)
    const configWithoutPassword = {
      type: "password" as const,
      targetUrl: data.targetUrl,
    };
    setConfig(configWithoutPassword);
    // Store password in temp field (NOT persisted to localStorage)
    setTempPassword(data.password);

    try {
      const isEditing = !!editingQrId;
      const url = isEditing ? `/api/qr/${editingQrId}` : "/api/qr";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          type: "password",
          targetUrl: data.targetUrl,
          config: {
            ...configWithoutPassword,
            password: data.password,
          },
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
        <h2 className="text-xl font-semibold text-gray-900">Password Protected QR</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gate your URL behind a password
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">QR Name</label>
        <input
          {...register("name")}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F6E56]"
          placeholder="Protected QR"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Protected URL</label>
        <input
          {...register("targetUrl")}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F6E56]"
          placeholder="https://example.com"
        />
        {errors.targetUrl && <p className="text-sm text-red-600">{errors.targetUrl.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-[#0F6E56]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            {...register("confirmPassword")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-[#0F6E56]"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
      </div>

      {password && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all", colorMap[strength.color])}
              style={{ width: `${(strength.score / 4) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{strength.label}</span>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Password is encrypted — QRise staff cannot access it.
        </p>
      </div>

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