"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OTPInput } from "@/components/auth/otp-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ForgotPasswordSchema, UpdatePasswordSchema } from "@/lib/validations/auth.schema";
import { Loader2, AlertCircle, ChevronLeft, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "email" | "otp" | "new-password";
type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
type UpdatePasswordFormData = z.infer<typeof UpdatePasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const passwordForm = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(UpdatePasswordSchema),
  });

  // Email step
  const handleEmailSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    setEmail(data.email);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/forgot-password?email=${encodeURIComponent(data.email)}`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setStep("otp");
    } catch (err) {
      console.error("Reset error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // OTP step
  const handleOtpSubmit = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "recovery",
      });

      if (verifyError) {
        setAttempts((prev) => prev - 1);
        if (attempts <= 1) {
          setError("No attempts remaining. Please start over.");
        } else {
          setError("Invalid code");
        }
        setOtp("");
        return;
      }

      setStep("new-password");
    } catch (err) {
      console.error("Verification error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Password step
  const handlePasswordSubmit = async (data: UpdatePasswordFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Success - redirect to login
      router.push("/login?message=password-reset");
    } catch (err) {
      console.error("Update error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const steps = [
    { id: 1, name: "Email", status: step === "email" ? "current" : "completed" },
    { id: 2, name: "Verify", status: step === "otp" ? "current" : step === "new-password" ? "completed" : "pending" },
    { id: 3, name: "New password", status: step === "new-password" ? "current" : "pending" },
  ];

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                s.status === "completed"
                  ? "bg-[#0F6E56] text-white"
                  : s.status === "current"
                  ? "bg-[#0F6E56]/20 text-[#0F6E56] border-2 border-[#0F6E56]"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {s.status === "completed" ? (
                <Check className="h-4 w-4" />
              ) : (
                s.id
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5",
                  steps[i + 1].status !== "pending" ? "bg-[#0F6E56]" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          {step === "email" && "Reset password"}
          {step === "otp" && "Check your email"}
          {step === "new-password" && "Create new password"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === "email" && "We'll send you a verification code"}
          {step === "otp" && `Enter the code sent to ${email}`}
          {step === "new-password" && "Enter your new password"}
        </p>
      </div>

      {/* Email step */}
      {step === "email" && (
        <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...emailForm.register("email")}
              className={cn(
                "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm",
                emailForm.formState.errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#0F6E56]"
              )}
              placeholder="you@example.com"
            />
            {emailForm.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 text-sm font-medium text-white bg-[#0F6E56] rounded-lg hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send code"
            )}
          </button>
        </form>
      )}

      {/* OTP step */}
      {step === "otp" && (
        <div className="space-y-4">
          <OTPInput value={otp} onChange={setOtp} error={error || undefined} />

          <button
            onClick={handleOtpSubmit}
            disabled={loading || otp.length !== 6}
            className="w-full flex justify-center items-center px-4 py-3 text-sm font-medium text-white bg-[#0F6E56] rounded-lg hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify"
            )}
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                setStep("email");
                setEmail("");
                setOtp("");
              }}
              className="text-sm text-[#0F6E56] hover:underline"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {/* Password step */}
      {step === "new-password" && (
        <form
          onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...passwordForm.register("password")}
                className={cn(
                  "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm pr-10",
                  passwordForm.formState.errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#0F6E56]"
                )}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              {...passwordForm.register("confirmPassword")}
              className={cn(
                "mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm",
                passwordForm.formState.errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#0F6E56]"
              )}
              placeholder="••••••••"
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 text-sm font-medium text-white bg-[#0F6E56] rounded-lg hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Update password"
            )}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-600">
        <a href="/login" className="flex items-center justify-center gap-1 text-[#0F6E56] hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Back to login
        </a>
      </p>
    </div>
  );
}